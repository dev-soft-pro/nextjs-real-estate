declare namespace TopHap {
  export interface Comparable {
    place: Place
    data: PropertyBase
    estimate: {
      key: number
      date: string
      accuracy: {
        min: number
        max: number
      }
      price: number
      ppsf: number
      rental_yield: number
      percent: number | null
    }[]
    market: {
      key: number
      date: string
      activeCount: number
      soldCount: number
      cdom: number
      price: number
      ppsf: number
    }[]
  }

  export type CompareEstimateMetric =
    | 'Estimate'
    | '$/ft² Estimate'
    | '% Change'
    | 'Rental Yield'
  export type CompareMarketMetric =
    | 'Health'
    | 'Inventory'
    | 'Sold Count'
    | 'CDOM'
    | 'Median Price'
    | 'Median $/ft²'
    | 'Turnover'
  export type CompareMetric = CompareEstimateMetric | CompareMarketMetric
  export type CompareMetricGroup = 'Estimate' | 'Market'

  export interface CompareState {
    preferences: {
      primary: number
      accuracy: boolean
      excludes: {
        [id: string]: boolean
      }
      type: CompareMetricGroup
      metric: CompareMetric
      ids: string[]
      dateOption: [number, OpUnitType]

      filter: {
        rental: boolean
        property_type: {
          values: PropertyType[]
        }
        living_area: NumberRange
      }
    }
    comparables: Comparable[]
  }

  export interface CompareCreators {
    setState(option: string, value: any, update?: boolean): AnyAction
    addComparable(place: Place): AnyAction
    addComparables(ids: string[]): AnyAction
    removeComparable(comparable: Comparable): AnyAction
    setComparables(ids: string[]): AnyAction
    updateComparables(): AnyAction
  }
}
