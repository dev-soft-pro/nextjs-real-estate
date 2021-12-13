declare namespace TopHap {
  export type Cursor = [string]
  export type Elevation = {
    id: string
    elevations: {
      h3: string
      alt: number
    }[]
  }

  export type MLS = {
    name: string
    overlay: boolean
    logo: string
    disclaimer: string
  }

  export type Zone = {
    id: string
    type: 'state' | 'country' | 'zip' | 'school' | 'place'
    location: Coordinate
    geometry: GeoJSON.Geometry
  }

  export type AnalyticsDescriptive = {
    key: string
    metric: number | string
    doc_count: number
    data?: any
  }

  export type AnalyticsDescriptiveParcel = {
    id: string
    value: number | string
    data?: any
  }

  export type EstimateByRadius = {
    _id: string
    _source: {
      address: Address
      Facts: Facts
      estimates: {
        trusted: number
        perform: string
      }
      locations: {
        parcelLocation: {
          lat: string
          lon: string
        }
      }
    }
  }

  export interface PropertiesState {
    map: {
      items: Property[]
      cursor?: Cursor
    }
    aggregations: {
      items: PropertyAggregation[]
      counts: {
        [key in PropertyStatus]: number
      }
    }
    list: {
      total: 0
      items: Property[]
      cursor?: Cursor | null
    }
    elevations: Elevation[]
    permits: {
      types: string[]
    }
    descriptive: {
      items: AnalyticsDescriptive[]
      min: number
      max: number
    }
    descriptiveParcels: {
      items: AnalyticsDescriptiveParcel[]
      min: number
      max: number
    }
    zones: {
      items: Zone[]
    }
    boundary: GeoJSON.Geometry[]
    neighborhood: {
      age: any[]
      bathrooms: any[]
      bedrooms: any[]
      living_area: any[]
      lot_size_acres: any[]
    }
    neighborhoodDom: {
      items: any[]
      dom: {
        from: string
        interval: string
      }
    }
    estimatesByRadius: EstimateByRadius[]
    mls: {
      [eleName: string]: MLS
    }
    hovered?: TopHap.Property
    detail?: {
      property: TopHap.PropertySource
      media?: TopHap.PropertyMedia
      estimates?: {
        key: number
        price: number
      }[]
      history?: TopHap.PropertyHistory[]
    }
  }

  export interface PropertiesCreators {
    resetProperties(): AnyAction
    resetMapProperties(): AnyAction
    getAggregations(): AnyAction
    getProperties(resetMode?: 'RESET' | 'SWAP'): AnyAction
    getMapProperties(): AnyAction
    resetElevations(): AnyAction
    getElevations(ids: string[] | string): AnyAction
    toggleElevation(id: string): AnyAction
    getBoundary(id: string): AnyAction
    getAnalyticsAggregate(): AnyAction
    getAnalyticsSearch(): AnyAction
    getPermitTypes(): AnyAction
    getZones(isNew?: boolean): AnyAction
    getNeighborhood(payload: any): AnyAction
    getNeighborhoodDom(payload: any): AnyAction
    getMlsInfo(mls: string): AnyAction
    estimateByRadius(payload: any): AnyAction
  }
}
