import * as turf from '@turf/turf'
import { AGGREGATION_AREA_SIZE, REGION_TYPES } from 'consts'

export function isPropertyMode(store: TopHap.StoreState) {
  const { map, drawings, place } = store.preferences
  if ((place && REGION_TYPES.includes(place.place_type[0])) || drawings.length)
    return true

  let area = turf.area(
    turf.bboxPolygon(map.viewport.bounds.flat() as turf.BBox)
  )
  area = turf.convertArea(area, 'meters', 'miles')

  return area <= AGGREGATION_AREA_SIZE
}
