import api from 'configs/api'
import invokeApi from 'utils/invokeApi'

export function getAddresses(ids: string[] | string): Promise<TopHap.Place[]> {
  return invokeApi({
    baseUrl: api.baseUrl,
    endpoint: api.geo.getAddresses,
    method: 'GET',
    path: { ids: typeof ids === 'string' ? ids : ids.join(',') }
  })
}

export function searchAddresses(payload: any) {
  return invokeApi({
    baseUrl: api.baseUrl,
    endpoint: api.geo.searchAddresses,
    method: 'GET',
    query: payload
  })
}

export function getZone(id: string, sourceIncludes?: string[]) {
  return invokeApi({
    baseUrl: api.baseUrl,
    endpoint: api.geo.getZone,
    method: 'POST',
    path: { id },
    body: { sourceIncludes }
  })
}

export function getZones(payload: any) {
  return invokeApi({
    baseUrl: api.baseUrl,
    endpoint: api.geo.getZones,
    method: 'POST',
    body: payload
  })
}
