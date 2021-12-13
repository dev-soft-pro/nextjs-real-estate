import lz from 'lz-string'
// import { initialState as initProperties } from 'store/reducers/properties'
import { initialState as initPreferences } from 'store/reducers/preferences'
import { initialState as initUI } from 'store/reducers/ui'

export function state2Hash(store: TopHap.StoreState) {
  const { preferences, properties, ui } = store
  const { map, filter } = preferences
  /**
   * m: map
   * - c: map.center
   * - z: map.zoom
   * - p: map.pitch
   * - b: map.bearing
   * - bo: map.bounds
   * mt: mapType
   * k: preferences.keyword
   * f: preferences.filter
   * s: preferences.sort
   * p: preferences.map.properties
   * d: preferences.map.descriptive
   * pf: preferences.map.profitOptions
   * pm: preferences.map.permitOptions
   * ev: preferences.map.elevations
   * t: preferences.map.timeline
   * z: preferences.map.zones
   * ep: properties.elevations
   * sv: ui.sider.visibility
   * sm: ui.siderMode
   * le: isLegendExpanded
   */
  const hash: any = {}

  // map viewport
  hash.m = {
    c: map.viewport.center,
    z: map.viewport.zoom,
    p: map.viewport.pitch,
    b: map.viewport.bearing,
    bo: map.viewport.bounds
  }

  // map type
  if (map.mapType !== initPreferences.map.mapType) {
    hash.mt = map.mapType
  }

  // keyword
  if (preferences.keyword) {
    hash.k = preferences.keyword
  }

  // filter
  const f: any = {}
  type FilterKey = keyof TopHap.Filter
  const filterKeys = Object.keys(filter).filter(
    e =>
      JSON.stringify(filter[e as FilterKey]) !==
      JSON.stringify(initPreferences.filter[e as FilterKey])
  ) as FilterKey[]
  filterKeys.forEach(e => {
    f[e] = filter[e]
  })
  if (filterKeys.length) {
    hash.f = f
  }

  // sort
  if (
    JSON.stringify(preferences.sort) !== JSON.stringify(initPreferences.sort)
  ) {
    hash.s = preferences.sort
  }

  // properties
  if (
    JSON.stringify(map.properties) !==
    JSON.stringify(initPreferences.map.properties)
  ) {
    hash.p = map.properties
  }

  // descriptive
  if (
    JSON.stringify(map.descriptive) !==
    JSON.stringify(initPreferences.map.descriptive)
  ) {
    hash.d = map.descriptive
  }

  // profitOptions, permitOptions, zones

  // elevations
  if (map.elevations) {
    hash.ev = map.elevations
  }

  // properties elevations
  if (properties.elevations.length) {
    hash.ep = properties.elevations.map(e => e.id)
  }

  // timeline
  if (map.timeline) {
    hash.t = map.timeline
  }

  // ui.sider.visible
  if (ui.sider.visible) {
    hash.sv = ui.sider.visible
  }

  // ui.siderMode
  if (ui.siderMode !== initUI.siderMode) {
    hash.sm = ui.siderMode
  }

  // ui.isLegendExpanded
  if (ui.isLegendExpanded !== initUI.isLegendExpanded) {
    hash.le = ui.isLegendExpanded
  }

  return hash
}

export function state2MapUrl(store: TopHap.StoreState) {
  return hash2MapUrl(state2Hash(store))
}

export function hash2MapUrl(hash: any) {
  hash = lz.compressToEncodedURIComponent(JSON.stringify(hash))

  // const { place } = store.preferences
  // let region = ''
  // if (place) {
  //   let type: string = place.place_type[0]
  //   if (type === 'place') {
  //     type = 'city'
  //   } else if (type === 'postcode') {
  //     type = 'zip'
  //   }

  //   const context = [
  //     'state',
  //     'county',
  //     'city',
  //     'postalCode',
  //     'neighborhood',
  //     'district',
  //     'streetName'
  //   ]
  //   region = context.reduce(
  //     (t, c) => (place.context[c] ? t + '/' + place.context[c] : t),
  //     `${type}/${place.id}`
  //   )
  //   region = region.replace(/\s+/g, '-').toLowerCase()
  // }

  // return region ? `/map/${region}/filter/${hash}` : `/map/filter/${hash}`
  return `/map/${hash}`
}

export function state2CompareUrl(
  preferences: TopHap.CompareState['preferences']
) {
  const {
    type,
    metric,
    primary,
    accuracy,
    dateOption,
    excludes,
    ids,
    filter
  } = preferences
  const idsString = ids.length ? ids.map(e => e).join(',') : '_'

  return `/compare/${idsString}/${lz.compressToEncodedURIComponent(
    JSON.stringify({
      type,
      metric,
      primary,
      accuracy,
      dateOption,
      excludes,
      filter
    })
  )}`
}

export function previewUrl(
  address: string,
  location: TopHap.Coordinate,
  width = 400,
  height = 300,
  zoom = 16,
  bo?: [TopHap.Coordinate, TopHap.Coordinate]
) {
  const hash = {
    k: address,
    m: {
      c: location,
      z: zoom,
      p: 0,
      b: 0,
      bo
    },
    p: {
      enabled: true
    }
  }

  return (
    `https://preview.tophap.com/map/${width}/${height}/` +
    lz.compressToEncodedURIComponent(JSON.stringify(hash))
  )
}
