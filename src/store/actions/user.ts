import { createActions } from 'reduxsauce'

const { Types, Creators } = createActions(
  {
    updateStates: ['payload'],
    getCurrentUserInfo: null,
    signIn: ['email', 'password'],
    signInWithGoogle: ['token'],
    signInWithFacebook: ['token'],
    signUp: ['payload'],
    confirmUser: ['payload'],
    resendConfirm: ['payload'],
    signOut: null,
    updateProfile: ['payload'],
    forgotPassword: ['email'],
    resetPassword: ['payload'],
    updatePassword: ['oldPassword', 'newPassword'],
    getGeoInfo: null,
    likeListing: ['id'],
    dislikeListing: ['id'],
    sendFeedback: ['payload'],
    getRecentSearches: null,
    addRecentSearch: ['place'],
    addRecentView: ['id'],
    createCustomer: ['payload'],
    updateCustomer: ['payload'],
    getCustomer: null,
    deleteSource: ['source'],
    createSubscription: ['plan'],
    updateSubscription: ['plan'],
    deleteSubscription: null,
    getInvoices: ['after', 'limit'],
    getUpcomingInvoice: null,
    addCoupon: ['coupon'],
    closeAccount: null,
    routeChanged: ['url']
  },
  {
    prefix: 'user/'
  }
)

export { Types, Creators }
