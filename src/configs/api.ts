export default {
  baseUrl: 'https://dev-api-v2.tophap.com',
  mapbox: 'https://api.mapbox.com',
  map: {
    getIsochrones: 'isochrone/v1/mapbox/{profile}/{coordinates}'
  },
  users: {
    membership: 'users/membership',
    geoInfo: 'users/geoInfo', // GET
    sendFeedback: 'users/feedback',
    logEvent: 'users/events',
    createCustomer: 'users/payment/customers',
    getCustomer: 'users/payment/customers', // GET
    updateCustomer: 'users/payment/customers', // PUT
    deleteSource: 'users/payment/customers/source', // DELETE
    createSubscription: 'users/payment/subscription',
    updateSubscription: 'users/payment/subscription', // PUT
    deleteSubscription: 'users/payment/subscription', // DELETE
    getInvoices: 'users/payment/invoices',
    getUpcomingInvoice: 'users/payment/invoices/upcoming', // GET
    addCoupon: 'users/payment/coupons',
    closeAccount: 'users/close' // DELETE
  },
  properties: {
    search: 'properties/search',
    get: 'properties/{id}',
    mget: 'properties/mget',
    getDetail: 'properties/detail',
    getAnalyticsAggregate: 'properties/analytics/aggregate',
    getAnalyticsSearch: 'properties/analytics/search',
    getAggregations: 'properties/aggregations',
    getNeighborhood: 'properties/neighborhood',
    getComparables: 'properties/comparables',
    getElevations: 'properties/elevations/{ids}'
  },
  permits: {
    getPermitTypes: 'permits/types' // GET
  },
  geo: {
    getParcel: 'geo/parcel',
    getParcels: 'geo/parcels',
    getZone: 'geo/zones/{id}',
    getZones: 'geo/zones',
    searchAddresses: 'geo/addresses',
    getAddresses: 'geo/addresses/{ids}'
  },
  estimates: {
    byRadius: 'estimates/by_radius',
    forCompare: 'estimates/for_compare',
    forMarket: 'estimates/for_market'
  }
}
