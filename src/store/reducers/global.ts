import { AnyAction } from 'redux'
import { createReducer } from 'reduxsauce'
import detectMobile from 'ismobilejs'

import { Types } from 'store/actions/global'
import customers from 'configs/customers'
import { mapStyle } from 'configs/mapbox'

export const initialState = {
  isMobile: {
    any: false,
    phone: false,
    tablet: false
  },
  customer: 'localhost',
  customerOptions: {
    isCompany: true,
    stage: 'prod' as 'dev' | 'staging' | 'prod',
    logo: '',
    mapStyle
  },
  status: {}
}

export function getInitState(host: string, ua: string) {
  const isMobile = detectMobile(ua)
  // set customer
  const match = host.match(/^(.*).tophap.com$/)
  const customer = match && match[1] ? match[1] : 'localhost'

  const customerOptions = (customers[customer as keyof typeof customers] ||
    {}) as TopHap.GlobalState['customerOptions']

  return {
    ...initialState,
    isMobile: {
      any: isMobile.any,
      phone: isMobile.phone,
      tablet: isMobile.tablet
    },
    customer: match && match[1] ? match[1] : 'localhost',
    customerOptions: {
      ...initialState.customerOptions,
      logo: `/images/companies/${customer}.png`,
      ...customerOptions,
      mapStyle: {
        ...initialState.customerOptions.mapStyle,
        ...(customerOptions.mapStyle || {})
      }
    }
  }
}

function updateAsyncActionStatus(state: TopHap.GlobalState, action: AnyAction) {
  return {
    ...state,
    status: {
      ...state.status,
      ...action.payload
    }
  }
}

const handlers = {
  [Types.UPDATE_ASYNC_ACTION_STATUS]: updateAsyncActionStatus
}

export default createReducer(initialState, handlers)
