declare namespace TopHap {
  type NumberRange = {
    min?: number
    max?: number
  }

  export type DateRange = {
    min?: string
    max?: string
  }

  export type Filter = {
    bathrooms: NumberRange
    bedrooms: NumberRange
    garage: NumberRange
    living_area: NumberRange
    lot_size_acres: NumberRange
    ownership_days: NumberRange
    period: DateRange
    price: NumberRange
    price_per_sqft: NumberRange
    property_type: {
      values: PropertyType[]
    }
    rental: boolean
    status: {
      values: PropertyStatus[]
      close_date: {
        min?: string
        max?: string
      }
    }
    stories: NumberRange
    year_built: NumberRange
    description: string
  }

  export type Sort = {
    option: PropertySortKey
    dir: 'asc' | 'desc'
  }

  export type MapPreferences = {
    mapType: MapType
    viewport: {
      bearing: number
      center: Coordinate
      pitch: number
      zoom: number
      bounds: Bounds
      updatedBy: 'INIT' | 'MAP' | 'USER'
    }
    properties: {
      enabled: boolean
      labelEnabled: boolean
      colorEnabled: boolean
      radiusEnabled: boolean
      color: PropertyMetric
      radius: PropertyMetric
      label: PropertyMetric
    }
    descriptive: {
      enabled: boolean
      filters: boolean
      metric: AnalyticsMetric
      hasCloseDate: boolean
      closeDate: DateRange
    }
    profitOptions: {
      mode: 'sum' | 'margin'
      docCount: number
      soldWithinDays: {
        min: number
        max: number
      }
      ownershipDays: {
        min: number
        max: number
      }
      profit: {
        min: number
        max: number
      }
    }
    permitOptions: {
      years: number
      closedOnly: boolean
      withTypes: boolean
      types: ['Elevator']
    }
    estimateOptions: {
      period:
        | 'past20Y'
        | 'past10Y'
        | 'past5Y'
        | 'past4Y'
        | 'past3Y'
        | 'past2Y'
        | 'past1Y'
        | 'past6M'
        | 'past1M'
        | 'next1Y'
        | 'next2Y'
    }
    estimateSoldRatioOptions: {
      type: 'percent' | 'value'
    }
    schoolOptions: {
      type: 'elementary' | 'middle' | 'high'
    }
    taxOptions: {
      type:
        | 'improvements'
        | 'land'
        | 'total'
        | 'billed'
        | 'billed_acre'
        | 'billed_sqft'
    }
    temperatureOptions: {
      winter: boolean
      type: 'low' | 'high' | 'average'
      min?: number
      max?: number
    }
    uniqueZonesOptions: {
      school: boolean
    }
    zones: {
      county: boolean
      place: boolean
      zip: boolean
      school: boolean
    }
    elevations: boolean
    timeline: boolean
  }

  export interface PreferencesState {
    keyword: string
    place?: Place
    drawings: GeoJSON.Feature<GeoJSON.Polygon>[]
    filter: Filter
    sort: Sort
    map: MapPreferences
  }

  export interface PreferencesCreators {
    addDrawing(feature: GeoJSON.Feature): AnyAction
    updateDrawing(feature: GeoJSON.Feature): AnyAction
    removeDrawing(feature: GeoJSON.Feature): AnyAction
    setFilterOption(option: string, value: any, update?: boolean): AnyAction
    setMapOption(option: string, value: any, update?: boolean): AnyAction
    setOption(option: string, value: any, update?: boolean): AnyAction
    updateKeyword(keyword: string): AnyAction
    updatePlace(place?: Place): AnyAction
    updateStates(payload: any): AnyAction
  }
}
