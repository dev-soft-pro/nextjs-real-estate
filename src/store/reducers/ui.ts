import { AnyAction } from 'redux'
import { createReducer } from 'reduxsauce'
import { Types } from 'store/actions/ui'

export const initialState: TopHap.UIState = {
  siderMode: 'list',
  sider: {
    visible: false,
    size: 'Normal',
    properties: {
      mode: 'List'
    }
  },
  isSideMenuExpanded: false,
  isLegendExpanded: true,
  viewport: {
    // iPhoneX resolution
    width: 375,
    height: 812
  },
  feedback: false
}

export function getInitState(isMobile: TopHap.GlobalState['isMobile']) {
  let width
  if (isMobile.phone) {
    width = 375
  } else if (isMobile.tablet) {
    width = 720
  } else {
    width = 960
  }

  return {
    ...initialState,
    viewport: {
      ...initialState.viewport,
      width
    }
  }
}

function updateStates(state: TopHap.UIState, action: AnyAction) {
  return {
    ...state,
    ...action.payload
  }
}

function updateSider(state: TopHap.UIState, action: AnyAction) {
  if (action.update) {
    return {
      ...state,
      sider: {
        ...state.sider,
        [action.field]: {
          //@ts-ignore
          ...state.sider[action.field],
          ...action.payload
        }
      }
    }
  } else {
    return {
      ...state,
      sider: {
        ...state.sider,
        [action.field]: action.payload
      }
    }
  }
}

function updateViewport(state: TopHap.UIState, action: AnyAction) {
  return {
    ...state,
    viewport: {
      ...state.viewport,
      ...action.viewport
    }
  }
}

function showFeedback(state: TopHap.UIState, action: AnyAction) {
  return {
    ...state,
    feedback: action.visible
  }
}

const handlers = {
  [Types.UPDATE_SIDER]: updateSider,
  [Types.UPDATE_STATES]: updateStates,
  [Types.UPDATE_VIEWPORT]: updateViewport,
  [Types.SHOW_FEEDBACK]: showFeedback
}

export default createReducer(initialState, handlers)
