import firebase from 'firebase/app'

export function firebaseAuth() {
  if (firebase.auth) {
    return Promise.resolve(firebase.auth())
  } else {
    return import('firebase/auth').then(() => firebase.auth())
  }
}

export function firestore() {
  if (firebase.firestore) {
    return Promise.resolve(firebase.firestore())
  } else {
    return import('firebase/firestore').then(() => firebase.firestore())
  }
}
