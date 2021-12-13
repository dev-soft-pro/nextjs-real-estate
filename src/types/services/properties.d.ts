declare namespace TopHap {
  export namespace Service {
    type PropertyRequestFilter = {
      bounds?: Bounds
      zones?: ZoneId[]
      metricsFilter?: Filter
    }

    type AnalyticsRequestFilter = PropertyRequestFilter & {
      closeDate?: DateRange
    }

    /**
     * group.zones should match types of filters.zones
     */
    export type GetAggregationRequest = {
      filters?: PropertyRequestFilter
      group: {
        h3?: {
          resolution?: number
          ids?: number[]
        }
        zones?: string[]
      }
      polygon?: GeoJSON.Polygon | GeoJSON.MultiPolygon
      withAnalytics?: boolean
    }

    export type GetAggregationResponse = {
      items: AggregationSource[]
      counts: {
        [key in PropertyStatus]: number
      }
    }

    export type SearchPropertiesRequest = {
      filters?: PropertyRequestFilter
      cursor?: Cursor | null
      from?: number
      size?: number
      sort?: Sort[]
      polygon?: GeoJSON.Polygon | GeoJSON.MultiPolygon
    }

    export type SearchPropertiesResponse = {
      items: PropertySource[]
      total: number
    }

    export type GetAnalyticsSearchRequest = {
      metric: AnalyticsMetric
      filters?: AnalyticsRequestFilter
      polygon?: GeoJSON.Polygon | GeoJSON.MultiPolygon
      options: any
    }

    export type GetAnalyticsAggregationRequest = GetAnalyticsSearchRequest & {
      group: {
        h3?: {
          resolution?: number
          ids?: number[]
        }
        zones?: ZoneType[]
      }
    }

    export type GetAnalyticsAggregationResponse = {
      items: AnalyticsDescriptive[]
    }

    export type GetAnalyticsSearchResponse = {
      items: AnalyticsDescriptiveParcel[]
    }

    export type GetDetailRequest = {
      attomId: string
      factsOnly?: boolean
      photosOnly?: boolean
      sort?: 'asc' | 'desc'
      withTypes?: boolean
      types?: TransactionType[]
    }

    export type GetNeighborhoodRequest = {
      dom?: {
        from?: string // now-4y
        to?: string // now
        interval?: 'year' | 'month' | 'week' | 'day' // 'month'
      }
      mode?: 'dom'
      shape?: GeoJSON.Polygon | GeoJSON.MultiPolygon
      year?: {
        min?: number // 1900
        max?: number // 2019
      }
      zones?: string[]
    }

    export type GetNeighborhoodResponse =
      | {
          dom: any[]
        }
      | {
          age: any[]
          bathrooms: any[]
          bedrooms: any[]
          living_area: any[]
          lot_size_acres: any[]
        }
  }
}
