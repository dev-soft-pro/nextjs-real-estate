import { AnyAction } from 'redux'
import { createReducer } from 'reduxsauce'
import * as d3Array from 'd3-array'
import isNil from 'lodash/isNil'

import {
  DEFAULT_MIN_PERCENTILE_PARCEL,
  DEFAULT_MAX_PERCENTILE_PARCEL,
  DEFAULT_MIN_PERCENTILE_AGGREGATION,
  DEFAULT_MAX_PERCENTILE_AGGREGATION
} from 'consts/data_mapping'
import { request, success } from 'utils/action'
import mergeArray from 'utils/merge_array'
import { setIn } from 'utils/object'
import { Types } from 'store/actions/properties'

export const initialState: TopHap.PropertiesState = {
  map: {
    items: [],
    cursor: undefined
  },
  aggregations: {
    items: [],
    counts: {
      New: 0,
      Active: 0,
      Pending: 0,
      Sold: 0,
      Inactive: 0
    }
  },
  list: {
    total: 0,
    items: [],
    cursor: undefined
  },
  elevations: [],
  permits: {
    types: []
  },
  descriptive: {
    items: [],
    min: 0,
    max: 0
  },
  descriptiveParcels: {
    items: [],
    min: 0,
    max: 0
  },
  zones: {
    items: []
  },
  boundary: [],
  neighborhood: {
    age: [],
    bathrooms: [],
    bedrooms: [],
    living_area: [],
    lot_size_acres: []
  },
  neighborhoodDom: {
    items: [],
    dom: {
      from: 'now-1y/d',
      interval: ''
    }
  },
  estimatesByRadius: [],
  mls: {},
  hovered: undefined,
  detail: undefined
}

export const commonSuccess = (
  state: TopHap.PropertiesState,
  action: AnyAction
) => {
  return {
    ...state,
    ...action.payload
  }
}

export const setState = (state: TopHap.PropertiesState, action: AnyAction) => {
  return setIn(state, action.option, action.value, action.update)
}

export const resetProperties = (state: TopHap.PropertiesState) => {
  return {
    ...state,
    list: initialState.list
  }
}

export const resetMapProperties = (state: TopHap.PropertiesState) => {
  return {
    ...state,
    map: initialState.map,
    aggregations: initialState.aggregations
  }
}

export const getPropertiesRequest = (
  state: TopHap.PropertiesState,
  action: AnyAction
) => {
  if (action.payload.reset) {
    return {
      ...state,
      list: initialState.list
    }
  } else {
    return state
  }
}

export const getPropertiesSuccess = (
  state: TopHap.PropertiesState,
  action: AnyAction
) => {
  return {
    ...state,
    list: {
      items: action.payload.isNew
        ? [...action.payload.items]
        : [...state.list.items, ...action.payload.items],
      cursor: action.payload.cursor,
      total: action.payload.total
    }
  }
}

export const getMapPropertiesSuccess = (
  state: TopHap.PropertiesState,
  action: AnyAction
) => {
  let newProperties
  const newItems = action.payload.items.filter(
    (e: TopHap.Property) => e.location !== undefined
  )

  if (state.map.items.length) {
    newProperties = [...state.map.items]
    mergeArray(newProperties, newItems, 'id')
  } else {
    newProperties = [...newItems]
  }

  if (action.payload.clearOld) {
    const bounds = action.payload.bounds
    newProperties = newProperties.filter(e => {
      const lat = e.location[1]
      const lng = e.location[0]

      if (
        lat >= bounds[0][1] &&
        lat <= bounds[1][1] &&
        lng >= bounds[0][0] &&
        lng <= bounds[1][0]
      ) {
        return true
      }

      return false
    })
  }

  return {
    ...state,
    map: {
      items: newProperties,
      cursor: action.payload.cursor
    }
  }
}

export const resetElevations = (state: TopHap.PropertiesState) => {
  return {
    ...state,
    elevations: []
  }
}

export const getElevationsSuccess = (
  state: TopHap.PropertiesState,
  action: AnyAction
) => {
  if (action.payload) {
    return {
      ...state,
      elevations: [...state.elevations, action.payload]
    }
  } else {
    return {
      ...state,
      elevations: state.elevations.filter(e => e.id !== action.payload.id)
    }
  }
}

export const toggleElevationSuccess = (
  state: TopHap.PropertiesState,
  action: AnyAction
) => {
  if (action.payload.item) {
    return {
      ...state,
      elevations: [...state.elevations, action.payload.item]
    }
  } else {
    return {
      ...state,
      elevations: state.elevations.filter(e => e.id !== action.payload.id)
    }
  }
}

export const getAnalyticsAggregateSuccess = (
  state: TopHap.PropertiesState,
  action: AnyAction
) => {
  const { items, metricData } = action.payload
  let min = Number.MAX_VALUE
  let max = Number.MIN_VALUE

  const sortedValues = items
    .map((d: any) => d.metric)
    .filter((d: any) => d !== null && !isNaN(d))
    .sort(d3Array.ascending)

  // @ts-ignore
  min = d3Array.quantileSorted(
    sortedValues,
    metricData.minPercentile || DEFAULT_MIN_PERCENTILE_AGGREGATION
  )
  // @ts-ignore
  max = d3Array.quantileSorted(
    sortedValues,
    metricData.maxPercentile || DEFAULT_MAX_PERCENTILE_AGGREGATION
  )

  return {
    ...state,
    descriptive: {
      items: items.filter(
        (e: any) =>
          !isNil(e.metric) && (!metricData.removeZero || e.metric !== 0)
      ),
      min,
      max
    }
  }
}

export const getAnalyticsSearchSuccess = (
  state: TopHap.PropertiesState,
  action: AnyAction
) => {
  const { items, metricData } = action.payload
  let min = Number.MAX_VALUE
  let max = Number.MIN_VALUE

  const sortedValues = items
    .map((d: any) => d.value)
    .filter((d: any) => d !== null && !isNaN(d))
    .sort(d3Array.ascending)

  // @ts-ignore
  min = d3Array.quantileSorted(
    sortedValues,
    metricData.minPercentile || DEFAULT_MIN_PERCENTILE_PARCEL
  )
  // @ts-ignore
  max = d3Array.quantileSorted(
    sortedValues,
    metricData.maxPercentile || DEFAULT_MAX_PERCENTILE_PARCEL
  )

  return {
    ...state,
    descriptiveParcels: {
      items: items
        .filter(
          (e: any) =>
            !isNil(e.value) && (!metricData.removeZero || e.metric !== 0)
        )
        .map((e: TopHap.AnalyticsDescriptiveParcel) => ({
          ...e,
          value: typeof e.value === 'boolean' ? String(e.value) : e.value
        })),
      min,
      max
    }
  }
}

export const getPermitTypesSuccess = (
  state: TopHap.PropertiesState,
  action: AnyAction
) => {
  return {
    ...state,
    permits: {
      ...state.permits,
      types: action.payload.items
    }
  }
}

export const getZonesSuccess = (
  state: TopHap.PropertiesState,
  action: AnyAction
) => {
  let newItems
  if (action.payload.isNew) {
    newItems = [...action.payload.items]
  } else {
    newItems = [...state.zones.items]
    mergeArray(newItems, action.payload.items, 'id')
  }

  if (action.payload.clearOld) {
    const bounds = action.payload.bounds
    newItems = newItems.filter(e => {
      const lat = e.location[1]
      const lng = e.location[0]

      if (
        lat - bounds[0][1] >= -0.2 &&
        lat - bounds[1][1] <= 0.2 &&
        lng - bounds[0][0] >= -0.2 &&
        lng - bounds[1][0] <= 0.2
      ) {
        return true
      }

      return false
    })
  }

  return {
    ...state,
    zones: {
      items: newItems
    }
  }
}

export const getMlsInfoSuccess = (
  state: TopHap.PropertiesState,
  action: AnyAction
) => {
  return {
    ...state,
    mls: {
      ...state.mls,
      [action.payload.mls]: action.payload.info
    }
  }
}

const handlers = {
  [Types.SET_STATE]: setState,
  [Types.UPDATE_STATES]: commonSuccess,
  [Types.RESET_PROPERTIES]: resetProperties,
  [Types.RESET_MAP_PROPERTIES]: resetMapProperties,
  [request(Types.GET_PROPERTIES)]: getPropertiesRequest,
  [success(Types.GET_PROPERTIES)]: getPropertiesSuccess,
  [success(Types.GET_AGGREGATIONS)]: commonSuccess,
  [success(Types.GET_MAP_PROPERTIES)]: getMapPropertiesSuccess,
  [Types.RESET_ELEVATIONS]: resetElevations,
  [success(Types.GET_ELEVATIONS)]: commonSuccess,
  [success(Types.TOGGLE_ELEVATION)]: toggleElevationSuccess,
  [success(Types.GET_BOUNDARY)]: commonSuccess,
  [success(Types.GET_ANALYTICS_AGGREGATE)]: getAnalyticsAggregateSuccess,
  [success(Types.GET_ANALYTICS_SEARCH)]: getAnalyticsSearchSuccess,
  [success(Types.GET_PERMIT_TYPES)]: getPermitTypesSuccess,
  [success(Types.GET_ZONES)]: getZonesSuccess,
  [success(Types.GET_NEIGHBORHOOD)]: commonSuccess,
  [success(Types.GET_NEIGHBORHOOD_DOM)]: commonSuccess,
  [success(Types.GET_MLS_INFO)]: getMlsInfoSuccess,
  [success(Types.ESTIMATE_BY_RADIUS)]: commonSuccess
}

export default createReducer(initialState, handlers)
