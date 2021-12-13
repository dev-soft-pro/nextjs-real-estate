declare namespace TopHap {
  export namespace Service {
    export type EstimateForCompareRequest = {
      bounds?: Bounds
      h3?: number
      month?: {
        min?: string // '1995-01-01'
        max?: string // now
      }
      properties?: string[]
      zones?: string[]
      rental?: boolean
      property_type?: {
        values: PropertyType[]
      }
      living_area?: NumberRange
    }

    export type EstimateForCompareResponse = {
      [prop: string]: any
    }

    export type EstimateForMarketRequest = EstimateForCompareRequest & {
      interval?: 'month' | 'week' | 'day' // 'month'
    }

    export type EstimateForMarketResponse = {
      [prop: string]: any
    }
  }
}
