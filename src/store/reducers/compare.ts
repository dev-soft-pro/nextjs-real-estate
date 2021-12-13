import { AnyAction } from 'redux'
import { createReducer } from 'reduxsauce'
import { success } from 'utils/action'
import { setIn } from 'utils/object'
import { Types } from 'store/actions/compare'

export const initialState: TopHap.CompareState = {
  preferences: {
    primary: 0,
    accuracy: false,
    excludes: {},
    type: 'Estimate',
    metric: 'Estimate',
    ids: [],
    dateOption: [0, 'y'],

    filter: {
      rental: false,
      property_type: {
        values: []
      },
      living_area: {}
    }
  },
  comparables: []
}

export const commonSuccess = (
  state: TopHap.CompareState,
  action: AnyAction
) => {
  return {
    ...state,
    ...action.payload
  }
}

export const setState = (state: TopHap.CompareState, action: AnyAction) => {
  return setIn(state, action.option, action.value, action.update)
}

export const setComparablesSuccess = (
  state: TopHap.CompareState,
  action: AnyAction
) => {
  return {
    ...state,
    comparables: action.payload
  }
}

export const addComparableSuccess = (
  state: TopHap.CompareState,
  action: AnyAction
) => {
  return {
    ...state,
    comparables: [...state.comparables, ...action.payload]
  }
}

export const addComparablesSuccess = (
  state: TopHap.CompareState,
  action: AnyAction
) => {
  return {
    ...state,
    comparables: [...state.comparables, ...action.payload]
  }
}

export const removeComparable = (
  state: TopHap.CompareState,
  action: AnyAction
) => {
  return {
    ...state,
    comparables: state.comparables.filter(
      e => e.place.id !== action.comparable.place.id
    )
  }
}

const handlers = {
  [Types.SET_STATE]: setState,
  [success(Types.SET_COMPARABLES)]: setComparablesSuccess,
  [success(Types.UPDATE_COMPARABLES)]: setComparablesSuccess,
  [success(Types.ADD_COMPARABLE)]: addComparableSuccess,
  [success(Types.ADD_COMPARABLES)]: addComparablesSuccess,
  [Types.REMOVE_COMPARABLE]: removeComparable
}

export default createReducer(initialState, handlers)
