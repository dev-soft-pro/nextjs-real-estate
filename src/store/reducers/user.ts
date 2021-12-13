import { AnyAction } from 'redux'
import { createReducer } from 'reduxsauce'
import { Types } from 'store/actions/user'
import { success } from 'utils/action'

export const initialState = {
  isAnonymous: undefined,
  uid: undefined,
  providerId: '',
  info: {},
  geoInfo: {},
  paymentInfo: undefined,
  history: [],
  recent: {
    searches: [],
    views: []
  },
  customer: undefined,
  invoices: {
    upcoming: {},
    items: [],
    hasMore: true
  }
}

export const commonSuccess = (state: TopHap.UserState, action: AnyAction) => {
  return {
    ...state,
    ...action.payload
  }
}

export const signInSuccess = (state: TopHap.UserState, action: AnyAction) => {
  return {
    ...state,
    isAnonymous: action.payload.user.isAnonymous,
    uid: action.payload.user.uid,
    info: action.payload.user
  }
}

export const signOutSuccess = () => {
  return initialState
}

export const updateProfileSuccess = (
  state: TopHap.UserState,
  action: AnyAction
) => {
  return {
    ...state,
    info: {
      ...state.info,
      ...action.payload
    }
  }
}

export const likeListingSuccess = (
  state: TopHap.UserState,
  action: AnyAction
) => {
  return {
    ...state,
    info: {
      ...state.info,
      likes: [...(state.info.likes || []), action.payload.id]
    }
  }
}

export const dislikeListingSuccess = (
  state: TopHap.UserState,
  action: AnyAction
) => {
  return {
    ...state,
    info: {
      ...state.info,
      likes: (state.info.likes || []).filter(
        (e: any) => e !== action.payload.id
      )
    }
  }
}

export const addRecentSearchSuccess = (
  state: TopHap.UserState,
  action: AnyAction
) => {
  return {
    ...state,
    recent: {
      ...state.recent,
      ...action.payload
    }
  }
}

export const deleteSourceSuccess = (state: TopHap.UserState) => {
  return {
    ...state,
    customer: {
      ...state.customer,
      sources: null
    }
  }
}

export const getUpcomingInvoiceSuccess = (
  state: TopHap.UserState,
  action: AnyAction
) => {
  return {
    ...state,
    invoices: {
      ...state.invoices,
      upcoming: action.payload
    }
  }
}

export const getInvoicesSuccess = (
  state: TopHap.UserState,
  action: AnyAction
) => {
  return {
    ...state,
    invoices: {
      ...state.invoices,
      items: [...state.invoices.items, ...(action.payload.items || [])],
      hasMore: action.payload.has_more
    }
  }
}

export const routeChanged = (state: TopHap.UserState, action: AnyAction) => {
  const baseUrl =
    window.location.protocol +
    '//' +
    window.location.hostname +
    (window.location.port ? ':' + window.location.port : '')

  return {
    ...state,
    history: [
      new Date().toLocaleString() + ' - ' + baseUrl + action.url,
      ...state.history
    ].slice(0, 15)
  }
}

const handlers = {
  [Types.UPDATE_STATES]: commonSuccess,
  [Types.ROUTE_CHANGED]: routeChanged,
  [success(Types.SIGN_IN)]: signInSuccess,
  [success(Types.SIGN_IN_WITH_GOOGLE)]: signInSuccess,
  [success(Types.SIGN_IN_WITH_FACEBOOK)]: signInSuccess,
  [success(Types.SIGN_UP)]: signInSuccess,
  [success(Types.UPDATE_PROFILE)]: updateProfileSuccess,
  [success(Types.GET_CURRENT_USER_INFO)]: signInSuccess,
  [success(Types.GET_CUSTOMER)]: commonSuccess,
  [success(Types.CREATE_CUSTOMER)]: commonSuccess,
  [success(Types.UPDATE_CUSTOMER)]: commonSuccess,
  [success(Types.DELETE_SOURCE)]: deleteSourceSuccess,
  [success(Types.GET_INVOICES)]: getInvoicesSuccess,
  [success(Types.GET_UPCOMING_INVOICE)]: getUpcomingInvoiceSuccess,
  [success(Types.CREATE_SUBSCRIPTION)]: commonSuccess,
  [success(Types.UPDATE_SUBSCRIPTION)]: commonSuccess,
  [success(Types.DELETE_SUBSCRIPTION)]: commonSuccess,
  [success(Types.SIGN_OUT)]: signOutSuccess,
  [success(Types.GET_GEO_INFO)]: commonSuccess,
  [success(Types.LIKE_LISTING)]: likeListingSuccess,
  [success(Types.DISLIKE_LISTING)]: dislikeListingSuccess,
  [success(Types.GET_RECENT_SEARCHES)]: commonSuccess,
  [success(Types.ADD_RECENT_SEARCHES)]: addRecentSearchSuccess,
  [success(Types.ADD_RECENT_VIEW)]: addRecentSearchSuccess
}

export default createReducer(initialState, handlers)
