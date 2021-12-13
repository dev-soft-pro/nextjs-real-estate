import Router from 'next/router'
import { Epic, ofType, StateObservable } from 'redux-observable'
import { defer, from, of } from 'rxjs'
import {
  catchError,
  map,
  startWith,
  switchMap,
  tap,
  mergeMap
} from 'rxjs/operators'
import Button from 'components/Button'
import { successCreator, failureCreator, requestCreator } from 'utils/action'
import { Types, Creators } from 'store/actions/user'
import * as services from 'services/user'
import { getAddresses } from 'services/geo'
import { showSuccess } from 'utils/message'
import notification from 'utils/notification'

const signUp: Epic = actions$ =>
  actions$.pipe(
    ofType(Types.SIGN_UP),
    switchMap(action =>
      from(services.signUp(action.payload)).pipe(
        map(res => successCreator(action.type, { user: res })),
        tap(() => {
          Router.push({
            pathname: Router.router?.pathname,
            query: { auth: 'signupsuccess' }
          })
        }),
        catchError(err => {
          if (err.code === 'auth/email-already-in-use') {
            return of(failureCreator(action.type, { err, showAlert: false }))
          } else {
            return of(failureCreator(action.type, { err, showAlert: true }))
          }
        }),
        startWith(requestCreator(action.type))
      )
    )
  )

const signIn: Epic = actions$ =>
  actions$.pipe(
    ofType(Types.SIGN_IN),
    switchMap(action =>
      from(services.signIn(action.email, action.password)).pipe(
        map(res => successCreator(action.type, { user: res })),
        tap(async ({ payload: { user } }) => {
          if (!user.emailVerified) {
            const confirm = await _resendConfirmMessage(
              'The user is not verified.'
            )
            if (confirm === 'Confirm') {
              services.sendActionEmail({
                action: 'verifyEmail',
                uid: user.uid,
                email: user.email,
                displayName: user.displayName,
                licenseNumber: user.licenseNumber
              })
            }
          }
        }),
        catchError(err => {
          if (err.code === 'auth/user-not-found') {
            err.message =
              'There is no user record corresponding to this identifier.'
          }
          return of(failureCreator(action.type, { err, showAlert: true }))
        }),
        startWith(requestCreator(action.type))
      )
    )
  )

const signInWithGoogle: Epic = actions$ =>
  actions$.pipe(
    ofType(Types.SIGN_IN_WITH_GOOGLE),
    switchMap(action =>
      from(services.signInWithGoogle(action.token)).pipe(
        map(res => successCreator(action.type, res)),
        tap(({ payload }) => {
          if (payload.isFirstSignIn) {
            Router.push({
              pathname: Router.router?.pathname,
              query: { auth: 'signupsuccess' }
            })
          }
        }),
        catchError(err => {
          // signout google
          // @ts-ignore
          if (window.gapi) {
            // @ts-ignore
            const auth2 = window.gapi.auth2.getAuthInstance()
            if (auth2 != null) {
              auth2
                .signOut()
                .then(() => auth2.disconnect())
                .then()
            }
          }

          return of(failureCreator(action.type, { err, showAlert: true }))
        }),
        startWith(requestCreator(action.type))
      )
    )
  )

const signInWithFacebook: Epic = actions$ =>
  actions$.pipe(
    ofType(Types.SIGN_IN_WITH_FACEBOOK),
    switchMap(action =>
      from(services.signInWithFacebook(action.token)).pipe(
        map(res => successCreator(action.type, res)),
        tap(({ payload }) => {
          if (payload.isFirstSignIn) {
            Router.push({
              pathname: Router.router?.pathname,
              query: { auth: 'signupsuccess' }
            })
          }
        }),
        catchError(err => {
          // signout facebook
          // @ts-ignore
          if (window.FB) {
            // @ts-ignore
            window.FB.logout()
          }

          return of(failureCreator(action.type, { err, showAlert: true }))
        }),
        startWith(requestCreator(action.type))
      )
    )
  )

const getCurrentUserInfo: Epic = actions$ =>
  actions$.pipe(
    ofType(Types.GET_CURRENT_USER_INFO),
    switchMap(action =>
      from(services.getCurrentUserInfo()).pipe(
        map(res => successCreator(action.type, { user: res })),
        catchError(err =>
          of(failureCreator(action.type, { err, showAlert: false }))
        ),
        startWith(requestCreator(action.type))
      )
    )
  )

const resendConfirm: Epic = actions$ =>
  actions$.pipe(
    ofType(Types.RESEND_CONFIRM),
    switchMap(action =>
      from(
        services.sendActionEmail({ ...action.payload, action: 'verifyEmail' })
      ).pipe(
        map(() => successCreator(action.type, {})),
        catchError(err =>
          of(failureCreator(action.type, { err, showAlert: true }))
        ),
        startWith(requestCreator(action.type))
      )
    )
  )

function _resendConfirmMessage(message: React.ReactNode) {
  return new Promise((resolve: (value?: unknown) => void) => {
    const key = 'user_notconfiremd_notification'
    const resend = () => {
      notification.close(key)
      resolve('Confirm')
    }
    notification.show({
      key,
      type: 'error',
      title: 'Not Confirmed!',
      message: (
        <div>
          {message}
          <br />
          Do you want to resend verification email?
        </div>
      ),
      onClose: () => resolve('Cancel'),
      btn: <Button onClick={resend}>Resend</Button>
    })
  })
}

const confirmUser: Epic = actions$ =>
  actions$.pipe(
    ofType(Types.CONFIRM_USER),
    switchMap(action =>
      from(
        services.completeActionEmail({
          ...action.payload,
          action: 'verifyEmail'
        })
      ).pipe(
        map(() => successCreator(action.type, {})),
        catchError(err => {
          if (err.message === 'expired') {
            _resendConfirmMessage('The link is expired.').then(confirm => {
              if (confirm === 'Confirm') {
                services.sendActionEmail({
                  uid: err.details.uid,
                  displayName: err.details.displayName,
                  email: err.details.email,
                  licenseNumber: err.details.licenseNumber,
                  action: 'verifyEmail'
                })
              }
            })
            return of(failureCreator(action.type, { err, showAlert: false }))
          } else {
            return of(
              failureCreator(action.type, {
                err: { message: 'Cannot verify the user!' },
                showAlert: true
              })
            )
          }
        }),
        startWith(requestCreator(action.type))
      )
    )
  )

const signOut: Epic = actions$ =>
  actions$.pipe(
    ofType(Types.SIGN_OUT),
    switchMap(action =>
      from(services.signOut()).pipe(
        map(() => successCreator(action.type, {})),
        catchError(err => of(failureCreator(action.type, { err }))),
        startWith(requestCreator(action.type))
      )
    )
  )

const forgotPassword: Epic = actions$ =>
  actions$.pipe(
    ofType(Types.FORGOT_PASSWORD),
    switchMap(action =>
      from(
        services.sendActionEmail({
          uid: '',
          displayName: '',
          email: action.email,
          action: 'resetPassword'
        })
      ).pipe(
        map(() => successCreator(action.type, {})),
        catchError(err =>
          of(failureCreator(action.type, { err, showAlert: true }))
        ),
        startWith(requestCreator(action.type))
      )
    )
  )

const resetPassword: Epic = actions$ =>
  actions$.pipe(
    ofType(Types.RESET_PASSWORD),
    switchMap(action =>
      from(
        services.completeActionEmail({
          ...action.payload,
          action: 'resetPassword'
        })
      ).pipe(
        map(() => successCreator(action.type, {})),
        tap(async () => {
          await showSuccess({
            title: 'Password Reset',
            content: 'New password is set successfully.'
          })
          Router.push({
            pathname: Router.router?.pathname,
            query: { auth: 'signin' }
          })
        }),
        catchError(err =>
          of(failureCreator(action.type, { err, showAlert: true }))
        ),
        startWith(requestCreator(action.type))
      )
    )
  )

const updatePassword: Epic = actions$ =>
  actions$.pipe(
    ofType(Types.UPDATE_PASSWORD),
    switchMap(action =>
      from(
        services.updatePassword(action.oldPassword, action.newPassword)
      ).pipe(
        map(res => successCreator(action.type, res)),
        tap(async () => {
          await showSuccess({
            title: 'Password Update',
            content: 'New password is set successfully.'
          })
        }),
        catchError(err =>
          of(failureCreator(action.type, { err, showAlert: true }))
        ),
        startWith(requestCreator(action.type))
      )
    )
  )

const updateProfile: Epic = actions$ =>
  actions$.pipe(
    ofType(Types.UPDATE_PROFILE),
    switchMap(action =>
      defer(async () => {
        const updates = {
          ...action.payload
        }

        if (action.payload.photoUrl) {
          updates.photoUrl = await services.uploadImage(action.payload.photoUrl)
        }

        await services.updateProfile(updates)
        return updates
      }).pipe(
        map(updates => successCreator(action.type, updates)),
        catchError(err =>
          of(failureCreator(action.type, { err, showAlert: true }))
        ),
        startWith(requestCreator(action.type))
      )
    )
  )

const closeAccount: Epic = actions$ =>
  actions$.pipe(
    ofType(Types.CLOSE_ACCOUNT),
    switchMap(action =>
      from(services.closeAccount()).pipe(
        mergeMap(() => of(successCreator(action.type, {}), Creators.signOut())),
        catchError(err => of(failureCreator(action.type, { err }))),
        startWith(requestCreator(action.type))
      )
    )
  )

const getRecentSearches: Epic = actions$ =>
  actions$.pipe(
    ofType(Types.GET_RECENT_SEARCHES),
    switchMap(action =>
      from(services.getRecentSearches()).pipe(
        map((res: any) =>
          successCreator(action.type, {
            recent: {
              searches: res.recent
                ? res.recent.map((e: string) => JSON.parse(e))
                : [],
              views: res.views
                ? res.views.map((e: string) => JSON.parse(e))
                : []
            }
          })
        ),
        catchError(err =>
          of(failureCreator(action.type, { err, showAlert: false }))
        ),
        startWith(requestCreator(action.type))
      )
    )
  )

const addRecentSearch: Epic = (
  actions$,
  state: StateObservable<TopHap.StoreState>
) =>
  actions$.pipe(
    ofType(Types.ADD_RECENT_SEARCH),
    switchMap(action =>
      defer(async () => {
        const { recent } = state.value.user
        const newSearches = [
          action.place,
          ...recent.searches.filter(e => e.id !== action.place.id)
        ].slice(0, 5)

        await services.updateRecentSearch(
          newSearches.map(e => JSON.stringify(e))
        )
        return newSearches
      }).pipe(
        map((res: any) => successCreator(action.type, { searches: res })),
        catchError(err =>
          of(failureCreator(action.type, { err, showAlert: false }))
        ),
        startWith(requestCreator(action.type))
      )
    )
  )

const addRecentView: Epic = (
  actions$,
  state: StateObservable<TopHap.StoreState>
) =>
  actions$.pipe(
    ofType(Types.ADD_RECENT_VIEW),
    switchMap(action =>
      defer(async () => {
        const { recent } = state.value.user
        let address = recent.views.find(e => e.id === action.id)
        if (!address) {
          address = (await getAddresses(action.id))[0]
        }

        const newViews = [
          address,
          ...recent.views.filter(e => e.id !== action.id)
        ].slice(0, 5)

        await services.updateRecentView(newViews.map(e => JSON.stringify(e)))
        return newViews
      }).pipe(
        map((res: any) => successCreator(action.type, { views: res })),
        catchError(err =>
          of(failureCreator(action.type, { err, showAlert: false }))
        ),
        startWith(requestCreator(action.type))
      )
    )
  )

const createCustomer: Epic = actions$ =>
  actions$.pipe(
    ofType(Types.CREATE_CUSTOMER),
    switchMap(action =>
      from(services.createCustomer(action.payload)).pipe(
        map(res => successCreator(action.type, { customer: res })),
        catchError(err =>
          of(failureCreator(action.type, { err, showAlert: true }))
        ),
        startWith(requestCreator(action.type))
      )
    )
  )

const updateCustomer: Epic = actions$ =>
  actions$.pipe(
    ofType(Types.UPDATE_CUSTOMER),
    switchMap(action =>
      from(services.updateCustomer(action.payload)).pipe(
        map(res => successCreator(action.type, { customer: res })),
        catchError(err =>
          of(failureCreator(action.type, { err, showAlert: true }))
        ),
        startWith(requestCreator(action.type))
      )
    )
  )

const getCustomer: Epic = actions$ =>
  actions$.pipe(
    ofType(Types.GET_CUSTOMER),
    switchMap(action =>
      from(services.getCustomer()).pipe(
        map(res => successCreator(action.type, { customer: res })),
        catchError(err =>
          of(failureCreator(action.type, { err, showAlert: false }))
        ),
        startWith(requestCreator(action.type))
      )
    )
  )

const createSubscription: Epic = actions$ =>
  actions$.pipe(
    ofType(Types.CREATE_SUBSCRIPTION),
    switchMap(action =>
      from(services.createSubscription(action.plan)).pipe(
        map(res => successCreator(action.type, { paymentInfo: res })),
        catchError(err => of(failureCreator(action.type, { err }))),
        startWith(requestCreator(action.type))
      )
    )
  )

const updateSubscription: Epic = actions$ =>
  actions$.pipe(
    ofType(Types.UPDATE_SUBSCRIPTION),
    switchMap(action =>
      from(services.updateSubscription(action.plan)).pipe(
        map(res => successCreator(action.type, { paymentInfo: res })),
        catchError(err => of(failureCreator(action.type, { err }))),
        startWith(requestCreator(action.type))
      )
    )
  )

const deleteSubscription: Epic = actions$ =>
  actions$.pipe(
    ofType(Types.DELETE_SUBSCRIPTION),
    switchMap(action =>
      from(services.deleteSubscription()).pipe(
        map(res => successCreator(action.type, { paymentInfo: res })),
        catchError(err => of(failureCreator(action.type, { err }))),
        startWith(requestCreator(action.type))
      )
    )
  )

const addCoupon: Epic = actions$ =>
  actions$.pipe(
    ofType(Types.ADD_COUPON),
    switchMap(action =>
      from(services.addCoupon(action.coupon)).pipe(
        map(res => successCreator(action.type, res)),
        catchError(err => {
          return of(
            failureCreator(action.type, { err: err.err ? err.err.raw : err })
          )
        }),
        startWith(requestCreator(action.type))
      )
    )
  )

const deleteSource: Epic = actions$ =>
  actions$.pipe(
    ofType(Types.DELETE_SOURCE),
    switchMap(action =>
      from(services.deleteSource(action.source)).pipe(
        map(res => successCreator(action.type, { customer: res })),
        catchError(err =>
          of(failureCreator(action.type, { err, showAlert: false }))
        ),
        startWith(requestCreator(action.type))
      )
    )
  )

const getInvoices: Epic = actions$ =>
  actions$.pipe(
    ofType(Types.GET_INVOICES),
    switchMap(action =>
      from(services.getInvoices(action.after, action.limit)).pipe(
        map(res => successCreator(action.type, res)),
        catchError(err =>
          of(failureCreator(action.type, { err, showAlert: false }))
        ),
        startWith(requestCreator(action.type))
      )
    )
  )

const getUpcomingInvoice: Epic = actions$ =>
  actions$.pipe(
    ofType(Types.GET_UPCOMING_INVOICE),
    switchMap(action =>
      from(services.getUpcomingInvoice()).pipe(
        map(res => successCreator(action.type, res)),
        catchError(err =>
          of(failureCreator(action.type, { err, showAlert: false }))
        ),
        startWith(requestCreator(action.type))
      )
    )
  )

const sendFeedback: Epic = (
  actions$,
  state: StateObservable<TopHap.StoreState>
) =>
  actions$.pipe(
    ofType(Types.SEND_FEEDBACK),
    switchMap(action =>
      from(
        services.sendFeedback({
          ...action.payload,
          payload: {
            ...action.payload.payload,
            history: state.value.user.history,
            resolution: `${window.innerWidth} * ${window.innerHeight}`,
            userAgent: navigator.userAgent
          }
        })
      ).pipe(
        map(res => successCreator(action.type, res)),
        catchError(err => of(failureCreator(action.type, { err }))),
        startWith(requestCreator(action.type))
      )
    )
  )

export default [
  signUp,
  signIn,
  signInWithGoogle,
  signInWithFacebook,
  resendConfirm,
  confirmUser,
  getCurrentUserInfo,
  signOut,
  forgotPassword,
  resetPassword,
  updatePassword,
  updateProfile,
  closeAccount,
  getRecentSearches,
  addRecentSearch,
  addRecentView,
  getCustomer,
  createCustomer,
  updateCustomer,
  createSubscription,
  updateSubscription,
  deleteSubscription,
  addCoupon,
  deleteSource,
  getInvoices,
  getUpcomingInvoice,
  sendFeedback
]
