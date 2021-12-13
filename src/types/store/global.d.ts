declare namespace TopHap {
  export interface GlobalState {
    isMobile: {
      any: boolean
      phone: boolean
      tablet: boolean
    }
    customer: string
    customerOptions: {
      isCompany: boolean
      stage: Stage
      logo: string
      mapStyle: {
        [key in MapType]: string
      }
    }
    status: {
      [type: string]: 'request' | 'success' | 'failure'
      err?: any
    }
  }
}
