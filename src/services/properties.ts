import _get from 'lodash/get'
import api from 'configs/api'
import invokeApi from 'utils/invokeApi'

export function search(
  payload: TopHap.Service.SearchPropertiesRequest
): Promise<TopHap.Service.SearchPropertiesResponse> {
  return invokeApi({
    baseUrl: api.baseUrl,
    endpoint: api.properties.search,
    method: 'POST',
    body: payload
  })
}

export function get(
  id: string,
  sourceIncludes?: string[]
): Promise<TopHap.PropertySource> {
  return invokeApi({
    baseUrl: api.baseUrl,
    endpoint: api.properties.get,
    method: 'POST',
    path: { id },
    body: { sourceIncludes }
  })
}

export function mget(
  ids: string[],
  sourceIncludes?: string[]
): Promise<TopHap.PropertySource[]> {
  return invokeApi({
    baseUrl: api.baseUrl,
    endpoint: api.properties.mget,
    method: 'POST',
    body: { ids, sourceIncludes }
  })
}

export function getDetail(
  params: TopHap.Service.GetDetailRequest
): Promise<TopHap.PropertyHistory[]> {
  return invokeApi({
    baseUrl: api.baseUrl,
    endpoint: api.properties.getDetail,
    method: 'POST',
    body: params
  })
}

export function getMedia(
  attomId: string
): Promise<TopHap.PropertyMedia | undefined> {
  return getDetail({
    attomId,
    factsOnly: true,
    photosOnly: true,
    sort: 'desc',
    withTypes: true,
    types: ['Listing']
  }).then(history => _get(history, '[0]._source.media'))
}

export function getAggregations(
  payload: TopHap.Service.GetAggregationRequest
): Promise<TopHap.Service.GetAggregationResponse> {
  return invokeApi({
    baseUrl: api.baseUrl,
    endpoint: api.properties.getAggregations,
    method: 'POST',
    body: payload
  })
}

export function getAnalyticsAggregate(
  payload: TopHap.Service.GetAnalyticsAggregationRequest
): Promise<TopHap.Service.GetAnalyticsAggregationResponse> {
  return invokeApi({
    baseUrl: api.baseUrl,
    endpoint: api.properties.getAnalyticsAggregate,
    method: 'POST',
    body: payload
  })
}

export function getAnalyticsSearch(
  payload: TopHap.Service.GetAnalyticsSearchRequest
): Promise<TopHap.Service.GetAnalyticsSearchResponse> {
  return invokeApi({
    baseUrl: api.baseUrl,
    endpoint: api.properties.getAnalyticsSearch,
    method: 'POST',
    body: payload
  })
}

export function getElevations(ids: string | string[]) {
  return invokeApi({
    baseUrl: api.baseUrl,
    endpoint: api.properties.getElevations,
    method: 'GET',
    path: { ids: typeof ids === 'string' ? ids : ids.join(',') }
  })
}

export function getPermitTypes() {
  return invokeApi({
    baseUrl: api.baseUrl,
    endpoint: api.permits.getPermitTypes,
    method: 'GET'
  })
}

export function getNeighborhood(
  payload: TopHap.Service.GetNeighborhoodRequest
): Promise<TopHap.Service.GetNeighborhoodResponse> {
  return invokeApi({
    baseUrl: api.baseUrl,
    endpoint: api.properties.getNeighborhood,
    method: 'POST',
    body: payload
  })
}

export function getMlsInfo(mls: string) {
  return fetch(
    `https://s3-us-west-2.amazonaws.com/tophap-assets/mls/${mls}.json`
  ).then(function(response) {
    if (response.status >= 400) {
      throw new Error('Bad response from server')
    }
    return response.json()
  })
}

export function estimateByRadius(payload: any) {
  return invokeApi({
    baseUrl: api.baseUrl,
    endpoint: api.estimates.byRadius,
    method: 'POST',
    body: payload
  })
}

export function estimateForCompare(
  payload: TopHap.Service.EstimateForCompareRequest
): Promise<TopHap.Service.EstimateForCompareResponse> {
  return invokeApi({
    baseUrl: api.baseUrl,
    endpoint: api.estimates.forCompare,
    method: 'POST',
    body: payload
  })
}

export function estimateForMarket(
  payload: TopHap.Service.EstimateForMarketRequest
): Promise<TopHap.Service.EstimateForMarketResponse> {
  return invokeApi({
    baseUrl: api.baseUrl,
    endpoint: api.estimates.forMarket,
    method: 'POST',
    body: payload
  })
}
