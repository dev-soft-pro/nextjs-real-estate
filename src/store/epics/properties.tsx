import { Epic, ofType, StateObservable } from 'redux-observable'
import { defer, from, of, Observable } from 'rxjs'
import { catchError, map, mergeMap, startWith, switchMap } from 'rxjs/operators'

import { REGION_TYPES } from 'consts'
import { getAnalyticsMetricData } from 'consts/data_mapping'
import { successCreator, failureCreator, requestCreator } from 'utils/action'
import { normalize, normalizeAggregation } from 'utils/properties'
import { Types, Creators } from 'store/actions/properties'
import * as services from 'services/properties'
import * as geoServices from 'services/geo'

const MAP_PAGE_SIZE = 500
const LIST_PAGE_SIZE = 30
const ZONE_PAGE_SIZE = 30

const _h3ResolutionForAggregations = (zoom: number) => {
  // need to return different value regarding zoom
  if (zoom > 9) {
    return 6
  } else if (zoom > 8) {
    return 5
  } else if (zoom > 7) {
    return 4
  } else {
    return 3
  }
}

const _h3ResolutionForAnalytics = (zoom: number) => {
  if (zoom > 12) {
    return 10
  } else if (zoom > 10) {
    return 9
  } else if (zoom > 8) {
    return 8
  } else if (zoom > 7) {
    return 7
  } else if (zoom > 6) {
    return 6
  } else {
    return 5
  }
}

const getAggregations: Epic = (
  actions$,
  state: StateObservable<TopHap.StoreState>
) =>
  actions$.pipe(
    ofType(Types.GET_AGGREGATIONS),
    switchMap(action =>
      defer(async function() {
        const { drawings, filter, place, map } = state.value.preferences
        const zones =
          place && REGION_TYPES.includes(place.place_type[0])
            ? [place.id]
            : undefined
        const { zoom, bounds } = map.viewport
        const h3Resolution = _h3ResolutionForAggregations(zoom)

        const polygon: GeoJSON.MultiPolygon | undefined = drawings.length
          ? {
              type: 'MultiPolygon',
              coordinates: drawings.map(e => e.geometry.coordinates)
            }
          : undefined

        return services.getAggregations({
          group: {
            h3: {
              resolution: h3Resolution
            }
          },
          filters: {
            bounds,
            zones,
            metricsFilter: filter
          },
          polygon
        })
      }).pipe(
        map(res =>
          successCreator(action.type, {
            aggregations: {
              items: res.items
                .filter((e: any) => e.centroid)
                .map((e: any) => normalizeAggregation(e)),
              counts: res.counts
            }
          })
        ),
        catchError(err => {
          return of(failureCreator(action.type, { err }))
        }),
        startWith(requestCreator(action.type))
      )
    )
  )

const getProperties: Epic = (
  actions$,
  state: StateObservable<TopHap.StoreState>
) =>
  actions$.pipe(
    ofType(Types.GET_PROPERTIES),
    switchMap(action =>
      Observable.create(async (observer: any) => {
        for await (const val of (async function*() {
          const { drawings, filter, place, map, sort } = state.value.preferences
          const { mls, list } = state.value.properties
          const { bounds } = map.viewport
          const zones =
            place && REGION_TYPES.includes(place.place_type[0])
              ? [place.id]
              : undefined
          let cursor = action.resetMode ? undefined : list.cursor

          const polygon: GeoJSON.MultiPolygon | undefined = drawings.length
            ? {
                type: 'MultiPolygon',
                coordinates: drawings.map(e => e.geometry.coordinates)
              }
            : undefined

          const res = await services.search({
            cursor: action.resetMode === 'SWAP' ? undefined : cursor,
            size: LIST_PAGE_SIZE,
            sort: [sort],
            filters: {
              bounds,
              zones,
              metricsFilter: filter
            },
            polygon
          })

          let items = res.items || []
          let property: any

          cursor =
            items.length === LIST_PAGE_SIZE
              ? items[items.length - 1].sort
              : null

          if (place) {
            if (place.place_type[0] === 'address') {
              if (cursor === undefined || action.resetMode === 'SWAP') {
                property = items.find(e => e._id === place.id)
                if (!property) {
                  property = await services.get(place.id)
                  res.total++
                }
              }
            }
          }

          if (property) {
            if (!items.find(e => e._id === property._id)) {
              res.total++
            }

            items = [property, ...items.filter(e => e._id !== property._id)]
          }

          const normalized = items
            .map(e => normalize(e))
            .filter(e => e.location && e.TophapStatus)

          const newMls: any = {}
          normalized.forEach(e => {
            if (e.mls && !mls[e.mls]) {
              newMls[e.mls] = true
            }
          })

          yield successCreator(action.type, {
            items: normalized,
            cursor,
            isNew: action.resetMode === 'SWAP',
            total: res.total
          })

          const arrMls = Object.keys(newMls)
          for (let i = 0; i < arrMls.length; ++i) {
            yield Creators.getMlsInfo(arrMls[i])
          }
        })()) {
          observer.next(val)
        }
      }).pipe(
        catchError(err => of(failureCreator(action.type, { err }))),
        startWith(
          requestCreator(action.type, { reset: action.resetMode === 'RESET' })
        )
      )
    )
  )

const getMapProperties: Epic = (
  actions$,
  state: StateObservable<TopHap.StoreState>
) =>
  actions$.pipe(
    ofType(Types.GET_MAP_PROPERTIES),
    switchMap(action =>
      Observable.create(async (observer: any) => {
        for await (const val of (async function*() {
          const { drawings, filter, place, map } = state.value.preferences
          const bounds = map.viewport.bounds
          const zones =
            place && REGION_TYPES.includes(place.place_type[0])
              ? [place.id]
              : undefined

          if (place) {
            if (place.place_type[0] === 'address') {
              const property = await services.get(place.id)
              yield successCreator(action.type, {
                items: [normalize(property)]
              })
            }
          }

          const chunkSize = MAP_PAGE_SIZE
          let needContinue = false
          let cursor

          const polygon: GeoJSON.MultiPolygon | undefined = drawings.length
            ? {
                type: 'MultiPolygon',
                coordinates: drawings.map(e => e.geometry.coordinates)
              }
            : undefined

          do {
            const res: TopHap.Service.SearchPropertiesResponse = await services.search(
              {
                cursor,
                size: chunkSize,
                sort: [{ option: 'id', dir: 'asc' }],
                filters: {
                  bounds,
                  zones,
                  metricsFilter: filter
                },
                polygon
              }
            )

            const items = res.items || []

            needContinue = items.length === chunkSize
            cursor = items.length ? items[items.length - 1].sort : undefined

            yield successCreator(action.type, {
              items: items
                .map((e: any) => normalize(e))
                .filter((e: TopHap.Property) => e.location && e.TophapStatus),
              cursor,
              clearOld: !polygon && !zones && !needContinue,
              bounds
            })

            if (needContinue) {
              yield requestCreator(action.type)
            }
          } while (needContinue)
        })()) {
          observer.next(val)
        }
      }).pipe(
        catchError(err => of(failureCreator(action.type, { err }))),
        startWith(requestCreator(action.type))
      )
    )
  )

const getBoundary: Epic = actions$ =>
  actions$.pipe(
    ofType(Types.GET_BOUNDARY),
    switchMap(action =>
      from(geoServices.getZone(action.id, ['zone'])).pipe(
        map((res: any) =>
          successCreator(action.type, { boundary: [res.zone] })
        ),
        catchError(err =>
          of(failureCreator(action.type, { err, showAlert: false }))
        ),
        startWith(requestCreator(action.type))
      )
    )
  )

const getAnalytics: Epic = (
  actions$,
  state: StateObservable<TopHap.StoreState>
) =>
  actions$.pipe(
    ofType(Types.GET_ANALYTICS_AGGREGATE, Types.GET_ANALYTICS_SEARCH),
    switchMap(action =>
      defer(async function() {
        const { drawings, filter, map, place } = state.value.preferences
        const {
          descriptive,
          profitOptions,
          permitOptions,
          estimateOptions,
          estimateSoldRatioOptions,
          schoolOptions,
          taxOptions,
          temperatureOptions,
          uniqueZonesOptions
        } = map
        const { metric, closeDate, hasCloseDate, filters } = descriptive
        const { zoom, bounds } = map.viewport

        const zones =
          place && REGION_TYPES.includes(place.place_type[0])
            ? [place.id]
            : undefined

        const polygon: GeoJSON.MultiPolygon | undefined = drawings.length
          ? {
              type: 'MultiPolygon',
              coordinates: drawings.map(e => e.geometry.coordinates)
            }
          : undefined

        let options = undefined
        if (metric === 'estimate_change') options = estimateOptions
        else if (metric === 'estimate_sold_ratio')
          options = estimateSoldRatioOptions
        else if (metric.startsWith('permits_')) options = permitOptions
        else if (metric === 'profit') options = profitOptions
        else if (metric.startsWith('school_')) {
          if (
            metric === 'school_college_bound' ||
            metric === 'school_test_score_rating'
          ) {
            options = { type: 'high' }
          } else {
            options = schoolOptions
          }
        } else if (metric === 'tax') options = taxOptions
        else if (metric === 'temperature') options = temperatureOptions
        else if (metric === 'unique_zones') options = uniqueZonesOptions

        const metricData = getAnalyticsMetricData(
          metric,
          action.type === Types.GET_ANALYTICS_AGGREGATE
            ? 'aggregation'
            : 'parcel'
        )

        const params = {
          metric,
          filters: {
            closeDate:
              hasCloseDate && metricData.hasCloseDate ? closeDate : undefined,
            metricsFilter: filters ? filter : undefined,
            zones,
            bounds
          },
          polygon,
          options
        }

        let res
        if (action.type === Types.GET_ANALYTICS_AGGREGATE) {
          res = await services.getAnalyticsAggregate({
            ...params,
            group: {
              h3: {
                resolution: _h3ResolutionForAnalytics(zoom)
              }
            }
          })
        } else {
          res = await services.getAnalyticsSearch(params)
        }

        return {
          metricData,
          res
        }
      }).pipe(
        map(({ res, metricData }) =>
          successCreator(action.type, { ...res, metricData })
        ),
        catchError(err => of(failureCreator(action.type, { err }))),
        startWith(requestCreator(action.type))
      )
    )
  )

const getElevations: Epic = actions$ =>
  actions$.pipe(
    ofType(Types.GET_ELEVATIONS),
    switchMap(action =>
      from(services.getElevations(action.ids)).pipe(
        map((res: any) => successCreator(action.type, { elevations: res })),
        catchError(err =>
          of(failureCreator(action.type, { err, showAlert: false }))
        ),
        startWith(requestCreator(action.type))
      )
    )
  )

const toggleElevation: Epic = (
  actions$,
  state: StateObservable<TopHap.StoreState>
) =>
  actions$.pipe(
    ofType(Types.TOGGLE_ELEVATION),
    switchMap(action =>
      defer(function() {
        const { elevations } = state.value.properties
        const ele = elevations.find(e => e.id === action.id)
        if (!ele) {
          return services.getElevations(action.id)
        }
        return Promise.resolve([])
      }).pipe(
        map(res =>
          successCreator(action.type, { id: action.id, item: res[0] })
        ),
        catchError(err => of(failureCreator(action.type, { err }))),
        startWith(requestCreator(action.type))
      )
    )
  )

const getPermitTypes: Epic = actions$ =>
  actions$.pipe(
    ofType(Types.GET_PERMIT_TYPES),
    switchMap(action =>
      from(services.getPermitTypes()).pipe(
        map((res: any) => successCreator(action.type, res)),
        catchError(err => of(failureCreator(action.type, { err }))),
        startWith(requestCreator(action.type))
      )
    )
  )

const getZones: Epic = (actions$, state: StateObservable<TopHap.StoreState>) =>
  actions$.pipe(
    ofType(Types.GET_ZONES),
    switchMap(action =>
      Observable.create(async (observer: any) => {
        for await (const val of (async function*() {
          const { bounds } = state.value.preferences.map.viewport
          const types = ['school']

          let res,
            from = 0,
            hasMore = false,
            isNew = action.isNew

          do {
            if (types.length) {
              res = await geoServices.getZones({
                bounds,
                types,
                from,
                size: ZONE_PAGE_SIZE
              })
            } else {
              res = { zones: [] }
            }

            hasMore = res.items.length === ZONE_PAGE_SIZE
            yield successCreator(action.type, {
              items: res.items.map((item: TopHap.PropertySource) => ({
                id: item._id,
                location: [
                  Number(item._source.location.lon),
                  Number(item._source.location.lat)
                ],
                type: item._source.type,
                geometry: item._source.zone
              })),
              isNew,
              clearOld: !hasMore,
              bounds
            })

            if (hasMore) {
              from += ZONE_PAGE_SIZE
              isNew = false
              yield requestCreator(action.type)
            }
          } while (hasMore)
        })()) {
          observer.next(val)
        }
      }).pipe(
        catchError(err => of(failureCreator(action.type, { err }))),
        startWith(requestCreator(action.type, {}))
      )
    )
  )

const getNeighborhood: Epic = actions$ =>
  actions$.pipe(
    ofType(Types.GET_NEIGHBORHOOD),
    switchMap(action =>
      from(services.getNeighborhood(action.payload)).pipe(
        map((res: any) => successCreator(action.type, { neighborhood: res })),
        catchError(err => of(failureCreator(action.type, { err }))),
        startWith(requestCreator(action.type))
      )
    )
  )

const getNeighborhoodDom: Epic = actions$ =>
  actions$.pipe(
    ofType(Types.GET_NEIGHBORHOOD_DOM),
    switchMap(action =>
      from(services.getNeighborhood({ ...action.payload, mode: 'dom' })).pipe(
        map((res: any) =>
          successCreator(action.type, {
            neighborhoodDom: {
              items: res.dom,
              dom: action.payload.dom
            }
          })
        ),
        catchError(err => of(failureCreator(action.type, { err }))),
        startWith(requestCreator(action.type))
      )
    )
  )

const getMlsInfo: Epic = actions$ =>
  actions$.pipe(
    ofType(Types.GET_MLS_INFO),
    mergeMap(action =>
      from(services.getMlsInfo(action.mls)).pipe(
        map((res: any) =>
          successCreator(action.type, { mls: action.mls, info: res })
        ),
        catchError(err => of(failureCreator(action.type, { err }))),
        startWith(requestCreator(action.type))
      )
    )
  )

const estimateByRadius: Epic = actions$ =>
  actions$.pipe(
    ofType(Types.ESTIMATE_BY_RADIUS),
    switchMap(action =>
      from(services.estimateByRadius(action.payload)).pipe(
        map((res: any) =>
          successCreator(action.type, { estimatesByRadius: res.items })
        ),
        catchError(err => of(failureCreator(action.type, { err }))),
        startWith(requestCreator(action.type))
      )
    )
  )

export default [
  getAggregations,
  getProperties,
  getMapProperties,
  getElevations,
  toggleElevation,
  getBoundary,
  getAnalytics,
  getPermitTypes,
  getZones,
  getNeighborhood,
  getNeighborhoodDom,
  getMlsInfo,
  estimateByRadius
]
