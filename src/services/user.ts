import firebase from 'firebase/app'

import api from 'configs/api'
import invokeApi from 'utils/invokeApi'

export async function validateUsername(username?: string) {
  // import firebase/firebase asynchronously
  if (!firebase.firestore) await import('firebase/firestore')

  const publicUsersRef = firebase.firestore().collectionGroup('public')

  const query = await publicUsersRef
    .where('username', '==', username)
    .limit(1)
    .get()

  return query.empty
}

export async function _generateUsername(base: string) {
  // import firebase/firebase asynchronously
  if (!firebase.firestore) await import('firebase/firestore')

  const normalized = base.replace(/\W/g, '')

  if (!normalized) return null

  const publicUsersRef = firebase.firestore().collectionGroup('public')

  let query = await publicUsersRef
    .where('username', '==', normalized)
    .limit(1)
    .get()
  if (query.empty) {
    return normalized
  }

  let username
  do {
    username = `${normalized}${Math.floor(Math.random() * 3000)}`
    query = await publicUsersRef
      .where('username', '==', username)
      .limit(1)
      .get()
  } while (!query.empty)

  return username
}

export async function _appUser(firebaseUser: any, makeUsername = false) {
  let username
  if (makeUsername) {
    if (firebaseUser.email) {
      username = firebaseUser.email.split('@')[0]
      username = await _generateUsername(username)
    } else if (firebaseUser.displayName) {
      username = await _generateUsername(firebaseUser.displayName)
    }
  }

  return {
    uid: firebaseUser.uid,
    username,
    type: 'user',
    visible: true,
    displayName: firebaseUser.displayName,
    photoUrl: firebaseUser.photoURL,
    email: firebaseUser.email,
    emailVerified: !!firebaseUser.emailVerified,
    phoneNumber: firebaseUser.phoneNumber,
    userSince: new Date(firebaseUser.metadata.creationTime).getTime(),
    isAnonymous: firebaseUser.isAnonymous,
    favorite: [],
    likes: []
  }
}

async function _mergeUsers(user: any, providerId: string, metaData = {}) {
  // import firebase/firebase asynchronously
  if (!firebase.firestore) await import('firebase/firestore')

  const providerData = user.providerData.find(
    (e: any) => e.providerId === providerId
  )

  const username = await _generateUsername(providerData.email.split('@')[0])

  const updates = {
    displayName: providerData.displayName,
    photoUrl: providerData.photoURL,
    email: providerData.email,
    emailVerified: user.emailVerified,
    phoneNumber: providerData.phoneNumber,
    username: username,
    isAnonymous: user.isAnonymous,
    ...metaData
  }

  const userRef = firebase
    .firestore()
    .collection('users')
    .doc(user.uid)

  // CONSIDER: remove await to speed up, but it might occur issues
  await userRef.update(updates)
  const userDoc = await userRef.get()

  return {
    ...userDoc.data(),
    ...updates
  }
}

async function _mergeAnonymousIntoExistingUser(
  anonymousUser: any,
  credential: any
) {
  // import firebase/firebase asynchronously
  if (!firebase.firestore) await import('firebase/firestore')

  const update = {} as any
  let anonymousUserRef
  if (anonymousUser) {
    anonymousUserRef = firebase
      .firestore()
      .collection('users')
      .doc(anonymousUser.uid)
    const anonymousUserDoc = await anonymousUserRef.get()

    if (anonymousUserDoc.exists) {
      // update user data
      const data = anonymousUserDoc.data() as any
      if (data.likes.length) {
        update.likes = firebase.firestore.FieldValue.arrayUnion(data.likes)
      }
      if (data.favorite.length) {
        update.favorite = firebase.firestore.FieldValue.arrayUnion(
          data.favorite
        )
      }
    }
  }

  const realUser = (await firebase.auth().signInWithCredential(credential))
    .user as any
  const realUserRef = firebase
    .firestore()
    .collection('users')
    .doc(realUser.uid)

  if (update.likes || update.favorite) {
    await realUserRef.update(update)
  }

  if (anonymousUserRef) {
    // don't use await for better performance, it will delete db data too by cloud function.
    if (anonymousUser.uid !== realUser.uid) {
      anonymousUserRef.delete()
    }
  }

  const realUserDoc = await realUserRef.get()
  return realUserDoc.data()
}

export async function signUp({
  name,
  email,
  password,
  licenseNumber,
  subscription
}: any) {
  let currentUser = firebase.auth().currentUser as any
  if (currentUser) {
    // if anonymous user exists, link it
    const credential = firebase.auth.EmailAuthProvider.credential(
      email,
      password
    )

    await currentUser.linkWithCredential(credential)
  } else {
    // This should never happen since we already have the anonymous user registered
    currentUser = (
      await firebase.auth().createUserWithEmailAndPassword(email, password)
    ).user
  }

  // while we trust only user in db, we don't need to update user profile.
  await currentUser.updateProfile({
    displayName: name
  })

  const res = await _mergeUsers(
    currentUser,
    firebase.auth.EmailAuthProvider.PROVIDER_ID,
    {
      unsubscribed: !subscription
    }
  )

  sendActionEmail({
    action: 'verifyEmail',
    uid: currentUser.uid,
    email,
    displayName: name,
    licenseNumber
  })

  return res
}

export async function signInWithCredential(
  providerId: string,
  credential: any,
  metaData = {}
) {
  let currentUser = firebase.auth().currentUser

  try {
    if (currentUser) {
      await currentUser.linkWithCredential(credential)
    } else {
      // This should never happen since we already have the anonymous user registered
      currentUser = (await firebase.auth().signInWithCredential(credential))
        .user
    }
    const user = await _mergeUsers(currentUser, providerId, metaData)
    return {
      user,
      isFirstSignIn: true,
      providerId
    }
  } catch (e) {
    if (e.code === 'auth/credential-already-in-use') {
      const user = await _mergeAnonymousIntoExistingUser(
        currentUser,
        credential
      )
      return {
        user,
        isFirstSignIn: false
      }
    } else {
      throw e
    }
  }
}

export function signIn(email: string, password: string) {
  const currentUser = firebase.auth().currentUser
  const credential = firebase.auth.EmailAuthProvider.credential(email, password)

  return _mergeAnonymousIntoExistingUser(currentUser, credential)
}

export function signInWithGoogle(token: string, metaData?: any) {
  const credential = firebase.auth.GoogleAuthProvider.credential(token)
  return signInWithCredential(
    firebase.auth.GoogleAuthProvider.PROVIDER_ID,
    credential,
    metaData
  )
}

export function signInWithFacebook(token: string, metaData?: any) {
  const credential = firebase.auth.FacebookAuthProvider.credential(token)
  return signInWithCredential(
    firebase.auth.FacebookAuthProvider.PROVIDER_ID,
    credential,
    metaData
  )
}

export async function sendActionEmail(payload: any) {
  // import firebase/functions asynchronously
  if (!firebase.functions) await import('firebase/functions')

  const cf = firebase.functions().httpsCallable('sendActionEmail')

  return cf({
    ...payload,
    deployment: document.location.hostname.split('.')[0]
  })
}

export async function completeActionEmail(payload: any) {
  // import firebase/functions asynchronously
  if (!firebase.functions) await import('firebase/functions')

  const cf = firebase.functions().httpsCallable('completeActionEmail')

  return cf(payload)
}

export async function getCurrentUserInfo() {
  // import firebase/firebase asynchronously
  if (!firebase.firestore) await import('firebase/firestore')

  const currentUser = firebase.auth().currentUser as any
  const firestore = firebase.firestore()

  const userRef = firestore.collection('users').doc(currentUser.uid)
  const userDoc = await userRef.get()

  if (userDoc.exists) {
    const cloudUser = userDoc.data() as any

    return {
      ...cloudUser,
      displayName: cloudUser.isAnonymous ? '' : cloudUser.displayName,
      username: cloudUser.isAnonymous ? '' : cloudUser.username
    }
  } else {
    return await _appUser(currentUser)
  }
}

export async function updatePassword(oldPassword: string, newPassword: string) {
  const user = firebase.auth().currentUser as any
  const credential = firebase.auth.EmailAuthProvider.credential(
    user.email,
    oldPassword
  )

  await user.reauthenticateWithCredential(credential)
  return user.updatePassword(newPassword)
}

export function signOut() {
  return firebase.auth().signOut()
}

export async function uploadImage(image: any) {
  const currentUser = firebase.auth().currentUser
  if (!currentUser) return

  // import firebase/storage asynchronously
  if (!firebase.storage) await import('firebase/storage')

  const storageRef = firebase.storage().ref()
  const imageRef = storageRef.child(`users/${currentUser.uid}/profile_image`)
  const res = await imageRef.putString(image, 'data_url')
  return res.ref.getDownloadURL()
}

export async function updateProfile(updates: any) {
  // import firebase/firebase asynchronously
  if (!firebase.firestore) await import('firebase/firestore')

  const currentUser = firebase.auth().currentUser as any

  const userRef = firebase
    .firestore()
    .collection('users')
    .doc(currentUser.uid)

  return userRef.update(updates)
}

export async function createCustomer(payload: any) {
  return invokeApi({
    baseUrl: api.baseUrl,
    endpoint: api.users.createCustomer,
    method: 'POST',
    body: payload,
    auth: true
  })
}

export async function updateCustomer(payload: any) {
  return invokeApi({
    baseUrl: api.baseUrl,
    endpoint: api.users.updateCustomer,
    method: 'PUT',
    body: { updates: payload },
    auth: true
  })
}

export async function getCustomer() {
  return invokeApi({
    baseUrl: api.baseUrl,
    endpoint: api.users.getCustomer,
    method: 'GET',
    auth: true
  })
}

export async function deleteSource(source: any) {
  return invokeApi({
    baseUrl: api.baseUrl,
    endpoint: api.users.deleteSource,
    method: 'DELETE',
    body: { source },
    auth: true
  })
}

export async function createSubscription(plan: any) {
  return invokeApi({
    baseUrl: api.baseUrl,
    endpoint: api.users.createSubscription,
    method: 'POST',
    body: { plan },
    auth: true
  })
}

export async function updateSubscription(plan?: string) {
  return invokeApi({
    baseUrl: api.baseUrl,
    endpoint: api.users.updateSubscription,
    method: 'PUT',
    body: { plan },
    auth: true
  })
}

export async function deleteSubscription() {
  return invokeApi({
    baseUrl: api.baseUrl,
    endpoint: api.users.deleteSubscription,
    method: 'DELETE',
    auth: true
  })
}

export async function getInvoices(starting_after: any, limit: any) {
  return invokeApi({
    baseUrl: api.baseUrl,
    endpoint: api.users.getInvoices,
    method: 'POST',
    body: {
      starting_after,
      limit
    },
    auth: true
  })
}

export async function getUpcomingInvoice() {
  return invokeApi({
    baseUrl: api.baseUrl,
    endpoint: api.users.getUpcomingInvoice,
    method: 'GET',
    auth: true
  })
}

export async function addCoupon(coupon: any) {
  return invokeApi({
    baseUrl: api.baseUrl,
    endpoint: api.users.addCoupon,
    method: 'POST',
    body: { coupon },
    auth: true
  })
}

export function getGeoInfo() {
  return invokeApi({
    baseUrl: api.baseUrl,
    endpoint: api.users.geoInfo,
    method: 'GET'
  })
}

export async function likeListing(id: string) {
  const currentUser = firebase.auth().currentUser
  if (!currentUser) {
    const err = { message: 'No User', code: 'auth/no-user' }
    throw err
  }

  // import firebase/firebase asynchronously
  if (!firebase.firestore) await import('firebase/firestore')

  const userRef = firebase
    .firestore()
    .collection('users')
    .doc(currentUser.uid)

  return userRef.update({
    likes: firebase.firestore.FieldValue.arrayUnion(id)
  })
}

export async function dislikeListing(id: string) {
  const currentUser = firebase.auth().currentUser
  if (!currentUser) {
    const err = { message: 'No User', code: 'auth/no-user' }
    throw err
  }

  // import firebase/firebase asynchronously
  if (!firebase.firestore) await import('firebase/firestore')

  const userRef = firebase
    .firestore()
    .collection('users')
    .doc(currentUser.uid)

  return userRef.update({
    likes: firebase.firestore.FieldValue.arrayRemove(id)
  })
}

export function sendFeedback(payload: TopHap.Service.SendFeedbackRequest) {
  return invokeApi({
    baseUrl: api.baseUrl,
    endpoint: api.users.sendFeedback,
    method: 'POST',
    body: payload
    // auth: true
  })
}

export async function getRecentSearches() {
  const currentUser = firebase.auth().currentUser
  if (!currentUser) {
    const err = { message: 'No User', code: 'auth/no-user' }
    throw err
  }

  // import firebase/firebase asynchronously
  if (!firebase.firestore) await import('firebase/firestore')

  const addressRef = firebase
    .firestore()
    .doc(`users/${currentUser.uid}/search/addresses`)
  const addressDoc = await addressRef.get()

  if (addressDoc.exists) {
    const address = addressDoc.data()
    return address
  }

  return []
}

export async function updateRecentSearch(recent: any) {
  const currentUser = firebase.auth().currentUser
  if (!currentUser) {
    const err = { message: 'No User', code: 'auth/no-user' }
    throw err
  }

  // import firebase/firebase asynchronously
  if (!firebase.firestore) await import('firebase/firestore')
  const addressRef = firebase
    .firestore()
    .doc(`users/${currentUser.uid}/search/addresses`)
  return addressRef.set(
    {
      recent
    },
    { merge: true }
  )
}

export async function updateRecentView(views: any) {
  const currentUser = firebase.auth().currentUser
  if (!currentUser) {
    const err = { message: 'No User', code: 'auth/no-user' }
    throw err
  }

  // import firebase/firebase asynchronously
  if (!firebase.firestore) await import('firebase/firestore')
  const addressRef = firebase
    .firestore()
    .doc(`users/${currentUser.uid}/search/addresses`)
  return addressRef.set(
    {
      views
    },
    { merge: true }
  )
}

export async function closeAccount() {
  return invokeApi({
    baseUrl: api.baseUrl,
    endpoint: api.users.closeAccount,
    method: 'DELETE',
    auth: true
  })
}
