import { createActions } from 'reduxsauce'

const { Types, Creators } = createActions(
  {
    resetProperties: null,
    resetMapProperties: null,
    getProperties: ['resetMode'],
    getMapProperties: null,
    getAggregations: null,
    getAnalyticsAggregate: null,
    getAnalyticsSearch: null,

    resetElevations: null,
    getElevations: ['ids'],
    toggleElevation: ['id'],

    getBoundary: ['id'],
    getZones: ['isNew'],
    getPermitTypes: null,

    getNeighborhood: ['payload'],
    getNeighborhoodDom: ['payload'],

    getMlsInfo: ['mls'],
    estimateByRadius: ['payload'],

    updateStates: ['payload'],
    setState: ['option', 'value', 'update']
  },
  {
    prefix: 'properties/'
  }
)

export { Types, Creators }
