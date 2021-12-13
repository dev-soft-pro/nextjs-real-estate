import { Epic, ofType, StateObservable } from 'redux-observable'
import { defer, of } from 'rxjs'
import { catchError, map, startWith, switchMap } from 'rxjs/operators'
import dayjs, { OpUnitType } from 'dayjs'
import uniq from 'lodash/uniq'
import get from 'lodash/get'
import isNil from 'lodash/isNil'

import { successCreator, failureCreator, requestCreator } from 'utils/action'
import { mergeObjectArray } from 'utils/merge_array'
import { normalize, normalizeAggregation } from 'utils/properties'
import { Types } from 'store/actions/compare'
import * as services from 'services/properties'
import * as geoServices from 'services/geo'

const _normalize = (res: {
  places: TopHap.Place[]
  properties: TopHap.Property[]
  zones: TopHap.PropertyAggregation[]
  estimate: any
  market: any
}): TopHap.Comparable[] =>
  res.places.map(place => {
    const data =
      place.place_type[0] === 'address'
        ? res.properties.find(e => e.id === place.id)
        : res.zones.find(e => e.key === place.id)

    // fill empty accuracy
    const accuracy: {
      key: number
      accuracy: {
        min: number
        max: number
      }
    }[] = res.estimate.accuracy[place.id].month.buckets.map((e: any) => ({
      key: e.key,
      accuracy: {
        min: get(e, ['low_smoothed', 'value'], 0),
        max: get(e, ['high_smoothed', 'value'], 0)
      }
    }))

    const firstAccuracy = accuracy.findIndex(e => e.accuracy.min)
    if (firstAccuracy >= 0) {
      for (let i = 0; i < firstAccuracy; ++i) {
        accuracy[i].accuracy = accuracy[firstAccuracy].accuracy
      }

      for (let i = Math.max(firstAccuracy + 1, 1); i < accuracy.length; ++i) {
        if (!accuracy[i].accuracy.min)
          accuracy[i].accuracy = accuracy[i - 1].accuracy
      }
    } else {
      accuracy.forEach(e => (e.accuracy = { min: 0, max: 0 }))
    }

    const market =
      place.place_type[0] === 'address'
        ? res.market.property[place.id]
        : res.market.zone[place.id]

    return {
      place,
      data: data,
      estimate: mergeObjectArray(
        (place.place_type[0] === 'address'
          ? res.estimate.property[place.id]
          : res.estimate.zone[place.id]
        ).month.buckets.map((e: any) => {
          const price = get(e, 'estimate_price.value')
          const gap = get(e, 'estimate_price_gap.value')
          const percent =
            isNil(price) || isNil(gap) ? null : price / (price - gap) - 1.0

          return {
            key: e.key,
            date: e.key_as_string,
            price,
            ppsf: get(e, 'estimate_ppsf.value'),
            percent,
            rental_yield: get(e, 'rent_yield.value')
          }
        }),
        accuracy,
        'key'
      ),
      market: mergeObjectArray(
        market.active.buckets.map((e: any) => ({
          key: e.key,
          date: e.key_as_string,
          activeCount: e.doc_count
        })),
        market.sold.months.buckets.map((e: any) => ({
          key: e.key,
          date: e.key_as_string,
          soldCount: e.doc_count,
          cdom: e.cdom.values['50.0'],
          price: e.median_price.values['50.0'],
          ppsf: e.median_ppsf.values['50.0']
        })),
        'key'
      )
    }
  }) as TopHap.Comparable[]

const _getIntervalAndMonth = (dateOption: [number, OpUnitType]) => {
  let month = {},
    interval = 'month'
  if (dateOption[0] > 0) {
    month = {
      min: dayjs().format('YYYY-MM-DD'),
      max: dayjs()
        .add(dateOption[0], dateOption[1])
        .format('YYYY-MM-DD')
    }
  } else if (dateOption[0] < 0) {
    month = {
      min: dayjs()
        .subtract(Math.abs(dateOption[0]), dateOption[1])
        .format('YYYY-MM-DD'),
      max: dayjs().format('YYYY-MM-DD')
    }

    if (dateOption[1] === 'w') {
      interval = 'day'
    } else if (dateOption[1] === 'M') {
      if (Math.abs(dateOption[0]) <= 2) {
        interval = 'week'
      }
    }
  }

  return [interval, month] as ['month' | 'week' | 'day', TopHap.DateRange]
}

const setComparables: Epic = (
  actions$,
  state: StateObservable<TopHap.StoreState>
) =>
  actions$.pipe(
    ofType(Types.ADD_COMPARABLE, Types.ADD_COMPARABLES, Types.SET_COMPARABLES),
    switchMap(action =>
      defer(async function() {
        const places =
          action.type === Types.ADD_COMPARABLE
            ? [action.place]
            : await geoServices.getAddresses(action.ids)
        const properties = places.filter(e => e.place_type[0] === 'address')
        const zones = places.filter(e => e.place_type[0] !== 'address')

        const {
          compare: {
            preferences: { filter, dateOption }
          }
        } = state.value

        const [interval, month] = _getIntervalAndMonth(dateOption)

        const estParams = {
          h3: 7,
          properties: properties.map(e => e.id),
          zones: zones.map(e => e.id),
          month,
          interval,
          ...filter
        }

        const res = await Promise.all([
          properties.length ? services.mget(properties.map(e => e.id)) : [],
          zones.length
            ? services.getAggregations({
                filters: { zones: zones.map(e => e.id) },
                group: { zones: uniq(zones.map(e => e.context.group)) },
                withAnalytics: true
              })
            : { items: [] },
          services.estimateForCompare(estParams),
          services.estimateForMarket(estParams)
        ])

        return {
          places,
          properties: res[0].map((e: TopHap.PropertySource) =>
            normalize(e, 'analytics')
          ),
          zones: res[1].items.map((e: TopHap.AggregationSource) =>
            normalizeAggregation(e, 'analytics')
          ),
          estimate: res[2],
          market: res[3]
        }
      }).pipe(
        map(res => successCreator(action.type, _normalize(res))),
        catchError(err => of(failureCreator(action.type, { err }))),
        startWith(requestCreator(action.type))
      )
    )
  )

const updateComparables: Epic = (
  actions$,
  state: StateObservable<TopHap.StoreState>
) =>
  actions$.pipe(
    ofType(Types.UPDATE_COMPARABLES),
    switchMap(action =>
      defer(async function() {
        const {
          compare: {
            preferences: { filter, dateOption },
            comparables
          }
        } = state.value
        const properties = comparables.filter(
          e => e.place.place_type[0] === 'address'
        )
        const zones = comparables.filter(
          e => e.place.place_type[0] !== 'address'
        )

        const [interval, month] = _getIntervalAndMonth(dateOption)

        const estParams = {
          h3: 7,
          properties: properties.map(e => e.place.id),
          zones: zones.map(e => e.place.id),
          month,
          interval,
          ...filter
        }

        const res = await Promise.all([
          services.estimateForCompare(estParams),
          services.estimateForMarket(estParams)
        ])

        return {
          places: comparables.map(e => e.place),
          properties: properties.map(e => e.data) as TopHap.Property[],
          zones: zones.map(e => e.data) as TopHap.PropertyAggregation[],
          estimate: res[0],
          market: res[1]
        }
      }).pipe(
        map(res => successCreator(action.type, _normalize(res))),
        catchError(err => of(failureCreator(action.type, { err }))),
        startWith(requestCreator(action.type))
      )
    )
  )

export default [setComparables, updateComparables]
