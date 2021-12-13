import { AnyAction } from 'redux'
import { createReducer } from 'reduxsauce'
import { setIn } from 'utils/object'
import { Types } from 'store/actions/preferences'

export const initialState: TopHap.PreferencesState = {
  keyword: '',
  place: undefined,
  drawings: [],
  filter: {
    bathrooms: {},
    bedrooms: {},
    garage: {},
    living_area: {},
    lot_size_acres: {},
    ownership_days: {},
    period: {},
    price: {},
    price_per_sqft: {},
    property_type: {
      values: []
    },
    rental: false,
    status: {
      values: [],
      close_date: {
        min: 'now-1M/d'
      }
    },
    stories: {},
    year_built: {},
    description: ''
  },
  sort: {
    option: 'status_timestamp',
    dir: 'desc'
  },
  map: {
    mapType: 'satellite',
    viewport: {
      center: [-122.436452978673, 37.71854821446419],
      zoom: 9,
      pitch: 0,
      bearing: 0,
      bounds: [
        [-122.69074785095899, 37.345827354135196],
        [-122.17576372009975, 38.0975091572424]
      ],
      updatedBy: 'INIT'
    },
    properties: {
      enabled: true,
      labelEnabled: true,
      colorEnabled: false,
      radiusEnabled: true,
      color: 'Price',
      radius: 'count', // 'LivingSqft'
      label: 'count' // 'Price'
    },
    descriptive: {
      enabled: true,
      filters: false,
      metric: 'estimate_price',
      hasCloseDate: false,
      closeDate: {
        min: 'now-1M/d',
        max: 'now'
      }
    },
    profitOptions: {
      mode: 'sum',
      docCount: 3,
      soldWithinDays: {
        min: 0,
        max: 180
      },
      ownershipDays: {
        min: 0,
        max: 540
      },
      profit: {
        min: 0,
        max: 4
      }
    },
    permitOptions: {
      years: 2,
      closedOnly: false,
      withTypes: false,
      types: ['Elevator']
    },
    estimateOptions: {
      period: 'past1Y'
    },
    estimateSoldRatioOptions: {
      type: 'percent'
    },
    schoolOptions: {
      type: 'high'
    },
    taxOptions: {
      type: 'total'
    },
    temperatureOptions: {
      winter: true,
      type: 'average'
    },
    uniqueZonesOptions: {
      school: true
    },
    zones: {
      county: true,
      place: true,
      zip: true,
      school: false
    },
    elevations: false,
    timeline: false
  }
}

export const setFilterOption = (
  state: TopHap.PreferencesState,
  action: AnyAction
) => {
  return {
    ...state,
    filter: setIn(state.filter, action.option, action.value, action.update)
  }
}

export const setMapOption = (
  state: TopHap.PreferencesState,
  action: AnyAction
) => {
  return {
    ...state,
    map: setIn(state.map, action.option, action.value, action.update)
  }
}

export const setOption = (
  state: TopHap.PreferencesState,
  action: AnyAction
) => {
  return setIn(state, action.option, action.value, action.update)
}

export const updateKeyword = (
  state: TopHap.PreferencesState,
  action: AnyAction
) => {
  return {
    ...state,
    keyword: action.keyword
  }
}

export const updatePlace = (
  state: TopHap.PreferencesState,
  action: AnyAction
) => {
  return {
    ...state,
    place: action.place
  }
}

export const addDrawing = (
  state: TopHap.PreferencesState,
  action: AnyAction
) => {
  return {
    ...state,
    drawings: [...state.drawings, action.feature]
  }
}

export const updateDrawing = (
  state: TopHap.PreferencesState,
  action: AnyAction
) => {
  return {
    ...state,
    drawings: state.drawings.map(e => {
      if (e.id === action.feature.id) {
        return action.feature
      } else {
        return e
      }
    })
  }
}

export const removeDrawing = (
  state: TopHap.PreferencesState,
  action: AnyAction
) => {
  return {
    ...state,
    drawings: state.drawings.filter(e => e.id !== action.feature.id)
  }
}

export const updateStates = (
  state: TopHap.PreferencesState,
  action: AnyAction
) => {
  return {
    ...state,
    ...action.payload
  }
}

const handlers = {
  [Types.SET_FILTER_OPTION]: setFilterOption,
  [Types.SET_MAP_OPTION]: setMapOption,
  [Types.SET_OPTION]: setOption,
  [Types.UPDATE_KEYWORD]: updateKeyword,
  [Types.UPDATE_PLACE]: updatePlace,
  [Types.ADD_DRAWING]: addDrawing,
  [Types.UPDATE_DRAWING]: updateDrawing,
  [Types.REMOVE_DRAWING]: removeDrawing,
  [Types.UPDATE_STATES]: updateStates
}

export default createReducer(initialState, handlers)
