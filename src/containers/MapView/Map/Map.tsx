import React from 'react'
import ReactDOM from 'react-dom'
import { batch } from 'react-redux'
import Router from 'next/router'
import { ReactReduxContext } from 'react-redux'
import ResizeDetector from 'react-resize-detector'
import { from, Subject, Subscription, Observable } from 'rxjs'
import {
  bufferCount,
  debounceTime,
  distinctUntilChanged,
  filter,
  map,
  skip
} from 'rxjs/operators'
import { h3ToGeo } from 'h3-js'
import debounce from 'lodash/debounce'
import isEqual from 'lodash/isEqual'
import lz from 'lz-string'
import MapboxGL from 'mapbox-gl'
import MapboxDraw from '@mapbox/mapbox-gl-draw'

import Model from './Model'
import mapboxDrawStyle from './_mapbox_draw_style'

import RotationControl from '../components/RotationControl'
import {
  BREAK_SM,
  MAP_SWITCHING_ZOOM_LEVEL,
  REGION_TYPES,
  SIDER_WIDTH,
  SIDER_WIDE_WIDTH,
  ZOOM_PRESETS
} from 'consts'
import {
  propertyData,
  formatPropertyMetric,
  formatAnalyticsMetric,
  getAnalyticsMetricData
} from 'consts/data_mapping'
import { MAP_PAGE } from 'consts/url'
import Button from 'components/Button'
import Popover from 'components/Popover'
import PropertyCard from 'components/PropertyCard/with_loading'
import 'libs/mapbox-gl-draw-freehand-mode'
import { logEvent } from 'services/analytics'
import { isPropertyMode } from 'utils/map'
import MapboxUtils from 'utils/mapbox'
import * as propertiesUtils from 'utils/properties'
import { state2MapUrl } from 'utils/url'

import AggregationPopup from '../components/Popups/Aggregation'
import AnalyticsPopup from '../components/Popups/Analytics'
import ElevationPopup from '../components/Popups/Elevation'

import CloseIcon from 'assets/images/icons/close.svg'
import { initialState as initPreferences } from 'store/reducers/preferences'
import { initialState as initUI } from 'store/reducers/ui'
import styles from './styles.scss?type=global'
import '@mapbox/mapbox-gl-draw/dist/mapbox-gl-draw.css'

interface MapProps {
  rentalEstimate: boolean
  setMapOption: TopHap.PreferencesCreators['setMapOption']
  resetProperties: TopHap.PropertiesCreators['resetProperties']
  resetMapProperties: TopHap.PropertiesCreators['resetMapProperties']
  getProperties: TopHap.PropertiesCreators['getProperties']
  getAggregations: TopHap.PropertiesCreators['getAggregations']
  getMapProperties: TopHap.PropertiesCreators['getMapProperties']
  getBoundary: TopHap.PropertiesCreators['getBoundary']
  getAnalyticsAggregate: TopHap.PropertiesCreators['getAnalyticsAggregate']
  getAnalyticsSearch: TopHap.PropertiesCreators['getAnalyticsSearch']
  toggleElevation: TopHap.PropertiesCreators['toggleElevation']
  getElevations: TopHap.PropertiesCreators['getElevations']
  getPermitTypes: TopHap.PropertiesCreators['getPermitTypes']
  getZones: TopHap.PropertiesCreators['getZones']
  addDrawing: TopHap.PreferencesCreators['addDrawing']
  updateDrawing: TopHap.PreferencesCreators['updateDrawing']
  removeDrawing: TopHap.PreferencesCreators['removeDrawing']
  updatePreferences: TopHap.PreferencesCreators['updateStates']
  updateSider: TopHap.UICreators['updateSider']
  updateUI: TopHap.UICreators['updateStates']
}

interface MapState {
  property?: TopHap.Property | string
}

const MAP_ID = 'MainMap'
const FLY_SPEED = 2

type Popup = mapboxgl.Popup & {
  type?: 'Property' | 'Aggregation' | 'Analytics' | 'Elevation'
}

/**
 * this class always need MapboxGL from the start, so it loads 'mapbox-gl' directly.
 */
export default class Map extends React.Component<MapProps, MapState> {
  map: mapboxgl.Map | null = null
  model: Model = new Model()
  // unsetupCountyListener?(): void
  // unsetupPlaceListener?(): void
  // unsetupZipListener?(): void

  state$: Observable<TopHap.StoreState> = from(
    this.context.store
  ) as Observable<TopHap.StoreState>
  styleLoad$ = new Subject<boolean>()
  preferences$?: Observable<TopHap.StoreState>
  properties$?: Observable<TopHap.StoreState>
  ui$?: Observable<TopHap.StoreState>
  filter$?: Observable<TopHap.StoreState>
  map$?: Observable<TopHap.StoreState>
  viewport$?: Observable<TopHap.StoreState>
  observable: {
    [eleName: string]: Observable<any>
  } = {}
  subscription = new Subscription()
  changeMode: 'push' | 'replace' = 'push'

  hoveredParcel?: mapboxgl.FeatureIdentifier
  selectedParcel?: mapboxgl.FeatureIdentifier

  popups: Popup[] = []
  popupContainers: HTMLDivElement[] = []
  disableZoom: 'NONE' | 'ONCE' | 'FOREVER' = 'NONE'

  preventHashParse = false
  hashString?: string
  touchStart?: mapboxgl.Point
  initialized = false

  aggregationPopupId?: string
  analyticsPopupId?: string
  elevationPopupId?: string
  propertyPopupId?: string

  static mapboxDraw?: any

  state: MapState = {
    property: undefined
  }

  componentDidMount() {
    this.onRouteChange()
    this.subscribe()
    this._createMap()
    Router.events.on('hashChangeComplete', this.onHashChange)
    Router.events.on('routeChangeComplete', this.onRouteChange)

    // const store: TopHap.StoreState = this.context.store.getState()
    // if (!store.properties.permits.types.length) {
    //   this.props.getPermitTypes()
    // }
  }

  componentDidUpdate(_prevProps: MapProps, prevState: MapState) {
    if (prevState.property !== this.state.property) {
      document.body.classList.toggle(
        'th-preview-showed',
        Boolean(this.state.property)
      )
    }
  }

  componentWillUnmount() {
    this.unsubscribe()
    this._destoryMap()
    Router.events.off('hashChangeComplete', this.onHashChange)
    Router.events.off('routeChangeComplete', this.onRouteChange)

    // remove .th-preview-showed from body
    document.body.classList.remove('th-preview-showed')
  }

  changeHash = (store: TopHap.StoreState) => {
    this.preventHashParse = true
    const hashString = state2MapUrl(store)

    if (hashString === this.hashString) return
    this.hashString = hashString

    if (this.changeMode === 'push') {
      Router.push(MAP_PAGE, hashString, {
        shallow: true
      })
    } else {
      Router.replace(MAP_PAGE, hashString, {
        shallow: true
      })
      this.changeMode = 'push'
    }
  }

  parseHash = (_place: string | undefined, hashString = '') => {
    return batch(() => {
      if (this.preventHashParse) {
        this.preventHashParse = false
        return
      }

      if (hashString === this.hashString) return
      this.hashString = hashString

      // TODO: Need to fetch place data using `place` instead of keyword

      const store: TopHap.StoreState = this.context.store.getState()
      const { preferences, ui } = store

      if (!hashString) return
      const hash = JSON.parse(lz.decompressFromEncodedURIComponent(hashString))

      // map
      if (hash.m) {
        const viewport = preferences.map.viewport
        if (
          JSON.stringify(hash.m.c) !== JSON.stringify(viewport.center) ||
          hash.m.z !== viewport.zoom ||
          hash.m.p !== viewport.pitch ||
          hash.m.b !== viewport.bearing ||
          hash.m.bo !== viewport.bounds
        ) {
          let updates: any = {
            pitch: hash.m.p,
            bearing: hash.m.b,
            updatedBy: 'INIT'
          }
          if (hash.m.bo) {
            updates = {
              ...updates,
              bounds: hash.m.bo
            }
          } else {
            updates = {
              ...updates,
              center: hash.m.c,
              zoom: hash.m.z
            }
          }
          this.props.setMapOption('viewport', updates, true)
        }
      }

      // map type
      const mapType = hash.mt || initPreferences.map.mapType
      if (mapType !== preferences.map.mapType) {
        this.props.setMapOption('mapType', mapType)
      }

      // keyword
      const keyword = hash.k || ''
      if (keyword !== preferences.keyword) {
        this.props.updatePreferences({ keyword })
      }

      // filter
      const filter = {
        ...initPreferences.filter,
        ...(hash.f || {})
      }
      if (JSON.stringify(filter) !== JSON.stringify(preferences.filter)) {
        this.props.updatePreferences({ filter })
      }

      // sort
      const sort = hash.s || initPreferences.sort
      if (JSON.stringify(sort) !== JSON.stringify(preferences.sort)) {
        this.props.updatePreferences({ sort })
      }

      // properties
      const properties = hash.p || initPreferences.map.properties
      if (
        JSON.stringify(properties) !==
        JSON.stringify(preferences.map.properties)
      ) {
        this.props.setMapOption('properties', properties)
      }

      // descriptive
      const descriptive = hash.d || initPreferences.map.descriptive
      if (
        JSON.stringify(descriptive) !==
        JSON.stringify(preferences.map.descriptive)
      ) {
        this.props.setMapOption('descriptive', descriptive)
      }

      // elevations
      if (hash.ev && !preferences.map.elevations) {
        this.props.setMapOption('elevations', true)
      }

      // properties elevations
      if (hash.ep) {
        this.props.getElevations(hash.ep)
      }

      // timeline
      if (hash.t && !preferences.map.timeline) {
        this.props.setMapOption('timeline', true)
      }

      // ui.sider.visible
      if (hash.sv && !ui.sider.visible) {
        this.props.updateSider('visible', true)
      }

      // ui.siderMode
      const siderMode = hash.sm || initUI.siderMode
      if (siderMode !== ui.siderMode) {
        this.props.updateUI({ siderMode })
      }

      // ui.isLegendExpanded
      const isLegendExpanded =
        hash.le !== undefined ? hash.le : initUI.isLegendExpanded
      if (isLegendExpanded !== ui.isLegendExpanded) {
        this.props.updateUI({ isLegendExpanded })
      }
    })
  }

  onRouteChange = () => {
    const hash = Router.router?.query.params as string[]

    if (!hash) return
    let place = undefined
    if (hash.length > 2) {
      // if place exists
      place = hash[1]
    }

    this.parseHash(place, hash[hash.length - 1])
  }

  onHashChange = (url: string) => {
    const hashString = url.split('#')[1]
    if (!hashString) return

    Router.replace(MAP_PAGE, `/map/${hashString}`, { shallow: true })
  }

  subscribe = () => {
    // most used observables
    function* subscriptions(_: Map) {
      _.preferences$ = _.state$.pipe(
        distinctUntilChanged(
          (prev, curr) => prev.preferences === curr.preferences
        )
      )

      _.properties$ = _.state$.pipe(
        distinctUntilChanged(
          (prev, curr) => prev.properties === curr.properties
        )
      )

      _.ui$ = _.state$.pipe(
        distinctUntilChanged((prev, curr) => prev.ui === curr.ui)
      )

      _.map$ = _.preferences$.pipe(
        distinctUntilChanged(
          (prev, curr) => prev.preferences.map === curr.preferences.map
        )
      )

      _.filter$ = _.preferences$.pipe(
        distinctUntilChanged(
          (prev, curr) => prev.preferences.filter === curr.preferences.filter
        )
      )

      _.observable.place$ = _.preferences$.pipe(
        map(store => store.preferences.place),
        distinctUntilChanged()
      )

      _.viewport$ = _.map$.pipe(
        distinctUntilChanged(
          (prev, curr) => prev === curr,
          store => store.preferences.map.viewport
        )
      )

      yield _.state$
        .pipe(
          distinctUntilChanged(
            (prev, curr: TopHap.StoreState) =>
              prev.preferences.keyword === curr.preferences.keyword &&
              prev.preferences.place === curr.preferences.place &&
              prev.preferences.filter === curr.preferences.filter &&
              prev.preferences.sort === curr.preferences.sort &&
              prev.preferences.map.mapType === curr.preferences.map.mapType &&
              // JSON.stringify(prev.preferences.map.viewport.center) ===
              //   JSON.stringify(curr.preferences.map.viewport.center) &&
              // prev.preferences.map.viewport.zoom ===
              //   curr.preferences.map.viewport.zoom &&
              prev.preferences.map.viewport.pitch ===
                curr.preferences.map.viewport.pitch &&
              prev.preferences.map.viewport.bearing ===
                curr.preferences.map.viewport.bearing &&
              isEqual(
                prev.preferences.map.viewport.bounds,
                curr.preferences.map.viewport.bounds
              ) &&
              prev.preferences.map.properties ===
                curr.preferences.map.properties &&
              prev.preferences.map.descriptive ===
                curr.preferences.map.descriptive &&
              prev.preferences.map.elevations ===
                curr.preferences.map.elevations &&
              prev.preferences.map.timeline === curr.preferences.map.timeline &&
              prev.properties.elevations === curr.properties.elevations &&
              prev.ui.siderMode === curr.ui.siderMode &&
              prev.ui.sider.visible === curr.ui.sider.visible &&
              prev.ui.isLegendExpanded === curr.ui.isLegendExpanded
          ),
          skip(2)
        )
        .subscribe(store => {
          _.changeHash(store)
        })

      // map loaded
      yield _.styleLoad$.subscribe(mapLoaded => {
        if (mapLoaded) {
          const store = _.context.store.getState()
          _.model.initMapStyle(store.preferences)

          if (!_.initialized) _.initialized = true
        }
      })

      /**
       * Data Fetch
       */

      // List Properties
      yield _.preferences$
        .pipe(
          distinctUntilChanged(
            (prev, curr: TopHap.PreferencesState) =>
              prev.filter === curr.filter && prev.place === curr.place,
            store => store.preferences
          ),
          skip(1),
          filter(store => store.preferences.map.properties.enabled)
        )
        .subscribe(store => {
          if (
            store.ui.sider.visible &&
            store.ui.siderMode === 'list' &&
            store.ui.sider.properties.mode === 'List'
          ) {
            _.props.getProperties('RESET')
          } else {
            _.props.resetProperties()
          }
        })

      yield _.preferences$
        .pipe(
          distinctUntilChanged(
            (prev, curr: TopHap.PreferencesState) =>
              prev.sort === curr.sort && prev.drawings === curr.drawings,
            store => store.preferences
          ),
          skip(1),
          filter(store => store.preferences.map.properties.enabled)
        )
        .subscribe(store => {
          if (
            store.ui.sider.visible &&
            store.ui.siderMode === 'list' &&
            store.ui.sider.properties.mode === 'List'
          ) {
            _.props.getProperties('SWAP')
          } else {
            _.props.resetProperties()
          }
        })

      // Map Properties
      yield _.preferences$
        .pipe(
          distinctUntilChanged(
            (prev, curr: TopHap.PreferencesState) =>
              prev.filter === curr.filter && prev.drawings === curr.drawings,
            store => store.preferences
          ),
          skip(1),
          filter(store => store.preferences.map.properties.enabled)
        )
        .subscribe(() => {
          _._refreshMapProperties()
        })

      // Analytics
      // CONSIDER: because of h3 resolution, we refetch when viewport is changed
      // even place or drawing is selected.
      yield _.state$
        .pipe(
          distinctUntilChanged(
            (prev, curr) =>
              prev.preferences.filter === curr.preferences.filter &&
              prev.preferences.drawings === curr.preferences.drawings &&
              isEqual(
                prev.preferences.map.viewport.bounds,
                curr.preferences.map.viewport.bounds
              ) &&
              prev.preferences.map.descriptive ===
                curr.preferences.map.descriptive &&
              (curr.preferences.map.descriptive.metric !== 'profit' ||
                prev.preferences.map.profitOptions ===
                  curr.preferences.map.profitOptions) &&
              (!curr.preferences.map.descriptive.metric.startsWith(
                'permits_'
              ) ||
                prev.preferences.map.permitOptions ===
                  curr.preferences.map.permitOptions) &&
              (curr.preferences.map.descriptive.metric !== 'estimate_change' ||
                prev.preferences.map.estimateOptions ===
                  curr.preferences.map.estimateOptions) &&
              (curr.preferences.map.descriptive.metric !== 'unique_zones' ||
                prev.preferences.map.uniqueZonesOptions ===
                  curr.preferences.map.uniqueZonesOptions) &&
              (curr.preferences.map.descriptive.metric !== 'temperature' ||
                prev.preferences.map.temperatureOptions ===
                  curr.preferences.map.temperatureOptions) &&
              (curr.preferences.map.descriptive.metric !== 'tax' ||
                prev.preferences.map.taxOptions ===
                  curr.preferences.map.taxOptions) &&
              (curr.preferences.map.descriptive.metric !==
                'estimate_sold_ratio' ||
                prev.preferences.map.estimateSoldRatioOptions ===
                  curr.preferences.map.estimateSoldRatioOptions) &&
              (!curr.preferences.map.descriptive.metric.startsWith('school_') ||
                prev.preferences.map.schoolOptions ===
                  curr.preferences.map.schoolOptions)
          ),
          skip(1),
          filter(
            store =>
              store.preferences.map.descriptive.enabled === true &&
              store.preferences.map.elevations === false
          )
        )
        .subscribe(store => {
          if (store.preferences.map.viewport.zoom >= MAP_SWITCHING_ZOOM_LEVEL) {
            _.props.getAnalyticsSearch()
          } else {
            _.props.getAnalyticsAggregate()
          }
        })

      // Zones
      yield _.map$
        .pipe(
          distinctUntilChanged(
            (prev, curr: TopHap.MapPreferences) =>
              prev.zones.school === curr.zones.school,
            store => store.preferences.map
          ),
          skip(1),
          filter(store => store.preferences.map.zones.school === true)
        )
        .subscribe(() => {
          _.props.getZones(true)
        })

      /**
       * Update Layers
       */

      // Map Style
      yield _.map$
        .pipe(
          distinctUntilChanged(
            (prev, curr: TopHap.MapPreferences) =>
              prev.mapType === curr.mapType,
            store => store.preferences.map
          ),
          skip(1)
        )
        .subscribe(store => {
          const { mapStyle } = store.global.customerOptions
          const style = mapStyle[store.preferences.map.mapType]
          _.map?.setStyle(style)
        })

      // Boundary Source / Layer
      yield _.properties$
        .pipe(
          map(store => store.properties.boundary),
          distinctUntilChanged(),
          skip(1)
        )
        .subscribe(boundary => {
          _.model.updateBoundarySource(boundary)
        })

      // Properties Sources / Layers
      /// Sources
      yield _.map$
        .pipe(
          distinctUntilChanged(
            (prev, curr: TopHap.MapPreferences) =>
              prev.properties.label === curr.properties.label,
            store => store.preferences.map
          ),
          skip(1)
        )
        .subscribe(store => {
          _.model.updatePropertiesSource(
            store.properties,
            store.preferences,
            _._isPropertyMode(store)
          )
        })

      yield _.map$
        .pipe(
          distinctUntilChanged(
            (prev, curr: TopHap.MapPreferences['properties']) =>
              prev.colorEnabled === curr.colorEnabled &&
              prev.radiusEnabled === curr.radiusEnabled &&
              prev.color === curr.color &&
              prev.radius === curr.radius,
            store => store.preferences.map.properties
          ),
          skip(1)
        )
        .subscribe(store => {
          _.model.updateCircleSource(
            store.properties,
            store.preferences,
            _._isPropertyMode(store)
          )
        })

      yield _.properties$
        .pipe(
          distinctUntilChanged(
            (prev, curr: TopHap.PropertiesState) =>
              prev.map.items === curr.map.items &&
              prev.aggregations.items === curr.aggregations.items,
            store => store.properties
          ),
          skip(1)
        )
        .subscribe(store => {
          const isProperty = _._isPropertyMode(store)
          _.model.updatePropertiesSource(
            store.properties,
            store.preferences,
            isProperty
          )
          _.model.updateCircleSource(
            store.properties,
            store.preferences,
            isProperty
          )
        })

      /// Layer
      yield _.map$
        .pipe(
          distinctUntilChanged(
            (prev, curr: TopHap.MapPreferences) =>
              prev.properties.enabled === curr.properties.enabled,
            store => store.preferences.map
          ),
          skip(1)
        )
        .subscribe(store => {
          _.model.showPropertiesLayer(store.preferences.map)
          _.model.showCircleLayer(store.preferences.map)
        })

      yield _.map$
        .pipe(
          distinctUntilChanged(
            (prev, curr: TopHap.MapPreferences) =>
              prev.properties.labelEnabled === curr.properties.labelEnabled,
            store => store.preferences.map
          ),
          skip(1)
        )
        .subscribe(store => {
          _.model.showPropertiesLayer(store.preferences.map)
        })

      // Analytics Source / Layer
      /// Source
      yield _.properties$
        .pipe(
          distinctUntilChanged(
            (prev, curr) =>
              prev.properties.descriptive.items ===
              curr.properties.descriptive.items
          ),
          skip(1)
        )
        .subscribe(store => {
          _.model?.updateAnalyticsSource(store.properties, store.preferences)
        })

      /// Layer
      yield _.map$
        .pipe(
          distinctUntilChanged(
            (prev, curr: TopHap.MapPreferences) =>
              prev.properties.enabled === curr.properties.enabled &&
              prev.elevations === curr.elevations &&
              prev.descriptive.enabled === curr.descriptive.enabled,
            store => store.preferences.map
          ),
          skip(1)
        )
        .subscribe(store => {
          _.model?.showAnalyticsLayer(store.preferences.map)
        })

      // Parcel Source / Layer
      /// Source
      yield _.properties$
        .pipe(
          distinctUntilChanged(
            (prev, curr) =>
              prev.properties.descriptiveParcels.items ===
              curr.properties.descriptiveParcels.items
          ),
          bufferCount(2, 1)
        )
        .subscribe(([prev, curr]) => {
          _.model?.updateParcelSources(
            prev.properties.descriptiveParcels.items,
            curr.properties.descriptiveParcels.items,
            curr.preferences.map
          )
        })

      /// Layer
      yield _.map$
        .pipe(
          distinctUntilChanged(
            (prev, curr: TopHap.MapPreferences) =>
              prev.elevations === curr.elevations &&
              prev.descriptive.enabled === curr.descriptive.enabled,
            store => store.preferences.map
          ),
          skip(1)
        )
        .subscribe(store => {
          _.model?.showParcelLayers(store.preferences.map)
        })

      // Elevation Source / Layer
      /// Source
      yield _.properties$
        .pipe(
          distinctUntilChanged(
            (prev, curr) => prev === curr,
            store => store.properties.elevations
          ),
          skip(1)
        )
        .subscribe(store => {
          _.model?.updateElevationSource(store.properties.elevations)
        })

      /// Layer
      yield _.preferences$
        .pipe(
          distinctUntilChanged(
            (prev, curr) => prev === curr,
            store => store.preferences.map.elevations
          ),
          skip(1)
        )
        .subscribe(store => {
          _.model?.showElevationLayer(store.preferences.map)
        })

      // Zone Source / Layer
      /// Source
      yield _.properties$
        .pipe(
          distinctUntilChanged(
            (prev, curr) => prev === curr,
            store => store.properties.zones.items
          ),
          skip(1)
        )
        .subscribe(store => {
          _.model?.updateZoneSource(store.properties.zones.items)
        })

      /// Layer
      yield _.map$
        .pipe(
          distinctUntilChanged(
            (prev, curr: TopHap.MapPreferences) => prev.zones === curr.zones,
            store => store.preferences.map
          ),
          skip(1)
        )
        .subscribe(store => {
          _.model.showZoneLayer(store.preferences.map.zones)
        })

      // place change
      yield _.observable.place$.pipe(skip(1)).subscribe(place => {
        _.handlePlaceChange(place)
      })

      // drawing change
      yield _.preferences$
        .pipe(
          distinctUntilChanged(
            (prev, curr: TopHap.PreferencesState) =>
              prev.drawings === curr.drawings,
            store => store.preferences
          ),
          skip(1),
          filter(store => store.preferences.map.properties.enabled)
        )
        .subscribe(store => {
          // when remove boundary
          if (!store.preferences.drawings.length) {
            Map.mapboxDraw.deleteAll()
          }
        })

      // viewport change
      yield _.viewport$
        .pipe(
          map(store => store.preferences.map.viewport),
          distinctUntilChanged((prev, curr) =>
            isEqual(prev.bounds, curr.bounds)
          ),
          skip(1)
        )
        .subscribe(viewport => {
          if (viewport.updatedBy === 'USER') {
            _.map?.fitBounds(viewport.bounds)
          }

          _.handleMapChange()
        })

      yield _.viewport$
        .pipe(
          map(store => store.preferences.map.viewport),
          distinctUntilChanged(
            (prev, curr) =>
              isEqual(prev.center, curr.center) &&
              prev.zoom === curr.zoom &&
              prev.bearing === curr.bearing &&
              prev.pitch === curr.pitch
          ),
          skip(1),
          filter(
            viewport =>
              viewport.updatedBy === 'USER' || viewport.updatedBy === 'INIT'
          )
        )
        .subscribe(viewport => {
          _.map?.flyTo({
            ...viewport,
            speed: FLY_SPEED
          })
        })

      // sider visibility change
      yield _.ui$
        .pipe(
          distinctUntilChanged(
            (prev, curr) => prev.ui.sider.visible === curr.ui.sider.visible
          ),
          skip(1)
        )
        .subscribe(store => {
          if (store.ui.sider.visible) {
            if (!store.preferences.map.properties.enabled) {
              _.props.setMapOption('properties.enabled', true)
            }

            if (store.ui.siderMode === 'list') {
              _.props.getProperties('RESET')
            }
          }
        })

      // sider size change
      yield _.ui$
        .pipe(
          distinctUntilChanged(
            (prev, curr) =>
              prev.ui.sider.visible === curr.ui.sider.visible &&
              prev.ui.sider.size === curr.ui.sider.size
          ),
          skip(1),
          filter(store => store.ui.viewport.width > BREAK_SM)
        )
        .subscribe(store => {
          _.map?.setPadding(
            {
              top: 0,
              left: store.ui.sider.visible
                ? store.ui.sider.size === 'Wide'
                  ? SIDER_WIDE_WIDTH
                  : SIDER_WIDTH
                : 0,
              right: 0,
              bottom: 0
            },
            {
              padding: store.ui.sider.visible
            }
          )
        })

      // viewport change
      yield _.ui$
        .pipe(
          distinctUntilChanged(
            (prev, curr) => prev.ui.viewport.width === curr.ui.viewport.width
          ),
          skip(1),
          debounceTime(100)
        )
        .subscribe(store => {
          _.map?.setPadding(
            {
              top: 0,
              left:
                store.ui.viewport.width > BREAK_SM && store.ui.sider.visible
                  ? store.ui.sider.size === 'Wide'
                    ? SIDER_WIDE_WIDTH
                    : SIDER_WIDTH
                  : 0,
              right: 0,
              bottom: 0
            },
            {
              padding: store.ui.sider.visible
            }
          )
        })

      // sider mode change
      yield _.ui$
        .pipe(
          distinctUntilChanged(
            (prev, curr) =>
              prev.ui.sider.properties.mode === curr.ui.sider.properties.mode
          ),
          skip(1)
        )
        .subscribe(store => {
          if (store.ui.sider.properties.mode === 'Detail') {
            _.model.setSelectedParcel(store.ui.sider.properties.id)
          } else {
            _.model.setSelectedParcel()
          }
        })

      // map properties enable
      yield _.preferences$
        .pipe(
          distinctUntilChanged(
            (prev, curr) => prev === curr,
            store => store.preferences.map.properties.enabled
          )
        )
        .subscribe(store => {
          if (store.ui.viewport.width > BREAK_SM) {
            if (
              store.preferences.map.properties.enabled !==
              store.ui.sider.visible
            ) {
              _.props.updateSider(
                'visible',
                store.preferences.map.properties.enabled
              )
            }
          } else {
            if (store.preferences.map.properties.enabled) {
              _._refreshMapProperties()
            }
          }
        })

      // hovered property
      yield _.properties$
        .pipe(
          distinctUntilChanged(
            (prev, curr) => prev === curr,
            store => store.properties.hovered
          ),
          skip(1)
        )
        .subscribe(store => {
          _.model?.setPropertyMarker(store.properties.hovered)
        })
    }

    const subs = subscriptions(this)
    let sub
    while (!(sub = subs.next()).done) {
      this.subscription.add(sub.value)
    }
  }

  unsubscribe = () => {
    this.subscription.unsubscribe()
  }

  _createMap = async () => {
    const store: TopHap.StoreState = this.context.store.getState()
    const { global, preferences } = store
    const { mapStyle } = global.customerOptions
    const { mapType, viewport } = preferences.map
    const style = mapStyle[mapType]

    const isNew = !MapboxUtils.backup[MAP_ID]
    this.map = await MapboxUtils.createMap(MAP_ID, viewport, style, 'th-map', {
      attributionControl: false
    })

    if (!this.map) return

    // set padding
    if (store.ui.viewport.width > BREAK_SM) {
      this.map.setPadding(
        {
          top: 0,
          left: store.ui.sider.visible
            ? store.ui.sider.size === 'Wide'
              ? SIDER_WIDE_WIDTH
              : SIDER_WIDTH
            : 0,
          right: 0,
          bottom: 0
        },
        {
          padding: store.ui.sider.visible
        }
      )
    }
    this.model.setMap(this.map)

    if (isNew) {
      Map.mapboxDraw = new MapboxDraw({
        displayControlsDefault: false,
        boxSelect: false,
        controls: {
          polygon: true,
          trash: true
        },
        styles: mapboxDrawStyle
      })

      const MapboxGL = await MapboxUtils.library()
      this.map
        .addControl(
          new MapboxGL.GeolocateControl({
            positionOptions: {
              maximumAge: 3000
            },
            trackUserLocation: true
          })
        )
        .addControl(
          new MapboxGL.AttributionControl({
            compact: true
          })
        )
        .addControl(new MapboxGL.NavigationControl(), 'top-right')
        .addControl(new MapboxGL.FullscreenControl(), 'top-right')
        .addControl(Map.mapboxDraw, 'top-right')
      this._showDrawTrash(false)
    } else {
      this.initialized = true
    }

    // this.unsetupCountyListener = this._setupBoundariesLayerListeners(
    //   'county-fills',
    //   'counties'
    // )
    // this.unsetupPlaceListener = this._setupBoundariesLayerListeners(
    //   'place-fills',
    //   'places'
    // )
    // this.unsetupZipListener = this._setupBoundariesLayerListeners(
    //   'zipcode-fills',
    //   'zipcodes'
    // )

    this.map.on('load', this.onLoad)
    this.map.on('moveend', this.onMoveEnd)
    this.map.on('zoomstart', this.onZoomStart)
    this.map.on('zoomend', this.onZoomEnd)

    this.map.on('touchstart', this.onTouchStart)
    this.map.on('touchend', this.onTouchEnd)
    this.map.on('click', this.onClick)
    this.map.on('mousemove', this.onMouseMove)
    this.map.on('mouseout', this.onMouseOut)
    this.map.on(
      'mousemove',
      this.model.parcelFillLayer.id,
      this.onMoveParcelFillLayer
    )
    this.map.on(
      'mouseleave',
      this.model.parcelFillLayer.id,
      this.onLeaveParcelFillLayer
    )
    this.map.on(
      'touchend',
      this.model.parcelFillLayer.id,
      this.onTouchEndParcelFillLayer
    )
    this.map.on('draw.create', this.onDrawCreate)
    this.map.on('draw.update', this.onDrawUpdate)
    this.map.on('draw.delete', this.onDrawDelete)
    this.map.on('draw.modechange', this.onDrawModeChange)
    this.map.on('draw.selectionchange', this.onDrawSelectionChange)
  }

  _destoryMap = () => {
    if (!this.map) return

    // remove markers
    this.model.setSelectedParcel()
    this.model.setAddressMarker()
    this.model.setPropertyMarker()
    if (this.hoveredParcel) {
      this.map.setFeatureState(this.hoveredParcel, { hover: false })
    }

    this.removePopups()

    // if (this.unsetupCountyListener) this.unsetupCountyListener()
    // if (this.unsetupPlaceListener) this.unsetupPlaceListener()
    // if (this.unsetupZipListener) this.unsetupZipListener()

    this.map.off('load', this.onLoad)
    this.map.off('moveend', this.onMoveEnd)
    this.map.off('zoomstart', this.onZoomStart)
    this.map.off('zoomend', this.onZoomEnd)

    this.map.off('touchstart', this.onTouchStart)
    this.map.off('touchend', this.onTouchEnd)
    this.map.off('click', this.onClick)
    this.map.off('mousemove', this.onMouseMove)
    this.map.off('mouseout', this.onMouseOut)
    this.map.off(
      'mousemove',
      this.model.parcelFillLayer.id,
      this.onMoveParcelFillLayer
    )
    this.map.off(
      'mouseleave',
      this.model.parcelFillLayer.id,
      this.onLeaveParcelFillLayer
    )
    this.map.off(
      'touchend',
      this.model.parcelFillLayer.id,
      this.onMoveParcelFillLayer
    )
    this.map.off('draw.create', this.onDrawCreate)
    this.map.off('draw.update', this.onDrawUpdate)
    this.map.off('draw.delete', this.onDrawDelete)
    this.map.off('draw.modechange', this.onDrawModeChange)
    this.map.off('draw.selectionchange', this.onDrawSelectionChange)

    MapboxUtils.destoryMap(MAP_ID, this.map)
  }

  _setupBoundariesLayerListeners = (mapLayer: string, sourceLayer: string) => {
    let hoveredStateId: string | number | undefined = undefined

    const map = this.map as mapboxgl.Map
    // When the user moves their mouse over the state-fill layer, we'll update the
    // feature state for the feature under the mouse.
    function onMouseMove(
      e: mapboxgl.MapMouseEvent & {
        features?: mapboxgl.MapboxGeoJSONFeature[] | undefined
      } & mapboxgl.EventData
    ) {
      if (e.features && e.features.length > 0) {
        if (hoveredStateId) {
          map.setFeatureState(
            {
              sourceLayer: sourceLayer,
              source: 'composite',
              id: hoveredStateId
            },
            { hover: false }
          )
        }
        hoveredStateId = e.features[0].id
        map.setFeatureState(
          { sourceLayer: sourceLayer, source: 'composite', id: hoveredStateId },
          { hover: true }
        )
      }
    }

    function onMouseLeave() {
      if (hoveredStateId) {
        map.setFeatureState(
          { sourceLayer: sourceLayer, source: 'composite', id: hoveredStateId },
          { hover: false }
        )
      }
      hoveredStateId = undefined
    }

    map.on('mousemove', mapLayer, onMouseMove)
    map.on('mouseleave', mapLayer, onMouseLeave)

    return () => {
      map.off('mousemove', mapLayer, onMouseMove)
      map.off('mouseleave', mapLayer, onMouseLeave)
    }
  }

  _isPropertyMode = (_store?: TopHap.StoreState) => {
    return isPropertyMode(_store ? _store : this.context.store.getState())
  }

  _refreshMapProperties = (reset = true) => {
    if (reset) {
      this.props.resetMapProperties()
    }

    if (this._isPropertyMode()) {
      this.props.getMapProperties()
    } else {
      this.props.getAggregations()
    }
  }

  handleMapChange = () => {
    const store: TopHap.StoreState = this.context.store.getState()
    const { map, drawings, place } = store.preferences
    if (map.properties.enabled) {
      const filterable =
        (place && REGION_TYPES.includes(place.place_type[0])) || drawings.length
      if (!filterable) {
        if (store.ui.siderMode === 'list') {
          if (store.ui.sider.visible) {
            this.props.getProperties('SWAP')
          } else {
            this.props.resetProperties()
          }
        }

        if (this._isPropertyMode()) {
          this.props.getMapProperties()
        } else {
          this.props.getAggregations()
        }
      }
    }

    if (map.zones.school) {
      this.props.getZones()
    }
  }

  handlePlaceChange = (place?: TopHap.Place) => {
    const store: TopHap.StoreState = this.context.store.getState()

    if (place) {
      // move to place
      if (place.bbox) {
        setTimeout(() => {
          this.map?.fitBounds(place.bbox as TopHap.Bounds, { padding: 20 })
        })
      } else {
        setTimeout(() => {
          this.map?.flyTo({
            center: place.center,
            zoom: place.place_type[0] === 'address' ? 18 : 16,
            speed: FLY_SPEED
          })
        })
      }
      this.changeMode = 'replace'

      // set marker at the address
      if (place.place_type[0] === 'address') {
        this.model.setAddressMarker(place)
      } else {
        this.model.setAddressMarker()
      }

      // get boundary
      if (REGION_TYPES.includes(place.place_type[0])) {
        this.props.getBoundary(place.id)
      }

      // show enable map properties
      if (!store.preferences.map.properties.enabled) {
        this.props.setMapOption('properties.enabled', true)
      }

      // remove drawings
      if (store.preferences.drawings.length) {
        this.props.updatePreferences({ drawings: [] })
      } else {
        this._refreshMapProperties()
      }
    } else {
      // remove marker
      this.model.setAddressMarker()

      if (store.preferences.map.properties.enabled) {
        this._refreshMapProperties()
      }

      // refetch analytics when remove place
      if (store.preferences.map.viewport.zoom >= MAP_SWITCHING_ZOOM_LEVEL) {
        this.props.getAnalyticsSearch()
      } else {
        this.props.getAnalyticsAggregate()
      }
    }
    this.model?.showBoundaryLayer(place)
  }

  handlePropertiesLayerClick = (
    ev: (mapboxgl.MapMouseEvent | mapboxgl.MapTouchEvent) & mapboxgl.EventData,
    feature: mapboxgl.MapboxGeoJSONFeature
  ) => {
    if (!this.map) return

    const store: TopHap.StoreState = this.context.store.getState()
    if (feature.properties?.id) {
      if (store.ui.viewport.width <= BREAK_SM) {
      } else {
        // property
        const index = Number(feature.properties.index)
        const item = store.properties.map.items[index]
        if (ev.originalEvent.altKey) {
          window.open(propertiesUtils.viewUrl(item.id, item.address))
        } else {
          this.viewDetail(item)
        }
      }
    } else if (feature.properties?.key) {
      // aggregation: zoom
      const index = Number(feature.properties.index)
      const item = store.properties.aggregations.items[index]

      this.map.flyTo({
        center: item.location,
        zoom: 13,
        speed: FLY_SPEED
      })
    }
  }

  handleParcelFillLayerClick = (
    _ev: (mapboxgl.MapMouseEvent | mapboxgl.MapTouchEvent) & mapboxgl.EventData,
    feature: mapboxgl.MapboxGeoJSONFeature
  ) => {
    const store: TopHap.StoreState = this.context.store.getState()
    const { elevations } = store.preferences.map

    if (elevations) {
      if (feature.id) this.props.toggleElevation(String(feature.id))
    } else {
      this.onLeaveParcelFillLayer()

      if (!store.global.isMobile.phone) {
        this.viewDetail(String(feature.id))
      }
    }
  }

  resetPopupId = (
    type?: 'Property' | 'Aggregation' | 'Analytics' | 'Elevation'
  ) => {
    if (type === 'Property') this.propertyPopupId = undefined
    else if (type === 'Aggregation') this.aggregationPopupId = undefined
    else if (type === 'Analytics') this.analyticsPopupId = undefined
    else if (type === 'Elevation') this.elevationPopupId = undefined
  }

  removePopups = () => {
    this.popups.forEach(popup => {
      const content = popup
        .getElement()
        .getElementsByClassName('mapboxgl-popup-content')[0]
      ReactDOM.unmountComponentAtNode(content.children[0])
      popup.remove()
    })
    this.popups = []

    this.propertyPopupId = undefined
    this.aggregationPopupId = undefined
    this.analyticsPopupId = undefined
    this.elevationPopupId = undefined

    if (this.state.property) {
      this.setState({ property: undefined })
    }
  }

  handlePopups = (
    ev: (mapboxgl.MapMouseEvent | mapboxgl.MapTouchEvent) & mapboxgl.EventData
  ) => {
    if (!this.map) return
    if (
      !this.model.propertiesLayer?.id ||
      !this.map.getLayer(this.model.propertiesLayer?.id)
    )
      return

    const layers = [
      this.model.propertiesLayer?.id,
      this.model.circleLayer?.id,
      this.model.analyticsLayer?.id,
      this.model.parcelMarkerLayer.id,
      this.model.parcelTitleLayer?.id,
      this.model.elevationLayer?.id,
      this.model.parcelFillLayer.id
    ]

    const features = this.map.queryRenderedFeatures(ev.point, { layers })

    if (features.length) {
      this.map.getCanvas().style.cursor = 'pointer'
      // handle only the topmost rendered feature
      this.showPopup(features[0], ev)
    } else {
      this.map.getCanvas().style.cursor = ''
      this.removePopups()
    }
  }

  showPopup = (
    feature: mapboxgl.MapboxGeoJSONFeature,
    ev: (mapboxgl.MapMouseEvent | mapboxgl.MapTouchEvent) & mapboxgl.EventData
  ) => {
    const store: TopHap.StoreState = this.context.store.getState()

    if (
      feature.layer.id === this.model.circleLayer?.id ||
      feature.layer.id === this.model.propertiesLayer?.id
    ) {
      const index = Number(feature.properties?.index)
      if (feature.properties?.id) {
        if (store.properties.map.items[index]) {
          this.showPropertyPopup(
            store.properties.map.items[index],
            store.properties.map.items[index].location
          )
        }
      } else if (feature.properties?.key) {
        if (!store.global.isMobile.any) {
          this.showAggregationPopup(
            store.properties.aggregations.items[index],
            feature.properties.fill
          )
        }
      }
    } else if (
      feature.layer.id === this.model.parcelMarkerLayer.id ||
      feature.layer.id === this.model.parcelTitleLayer?.id
    ) {
      this.showParcelPopup(feature)
    } else if (feature.layer.id === this.model.parcelFillLayer.id) {
      if (!store.preferences.map.elevations) {
        if (store.global.isMobile.any) {
          this.showParcelPopup(feature)
        } else {
          if (store.preferences.map.descriptive.enabled) {
            const index = Number(feature.state.index)
            this.showAnalyticsParcelPopup(
              store.properties.descriptiveParcels.items[index],
              feature.state.color,
              ev.lngLat
            )
          }
        }
      }
    } else if (feature.layer.id === this.model.analyticsLayer?.id) {
      const index = Number(feature.properties?.index)
      this.showAnalyticsPopup(
        store.properties.descriptive.items[index],
        feature.properties?.fill
      )
    } else if (feature.layer.id === this.model.elevationLayer?.id) {
      if (!store.global.isMobile.any) {
        this.showElevationPopup(
          feature.properties?.key,
          feature.properties?.alt,
          ev.lngLat
        )
      }
    }
  }

  closePropertyPopup = (ev?: React.MouseEvent<HTMLButtonElement>) => {
    if (ev) ev.stopPropagation()

    this.removePopups()
  }

  _newPopup = (multiEnabled = false, payload: any = {}): Popup => {
    if (!multiEnabled) {
      this.removePopups()
    }

    const popup = new MapboxGL.Popup({
      closeButton: false,
      closeOnClick: false,
      className: 'th-preview-container',
      ...payload
    })
    this.popups.push(popup)

    return popup
  }

  showAggregationPopup = (
    aggregation: TopHap.PropertyAggregation,
    color: string,
    multiEnabled = false
  ) => {
    if (!aggregation) return
    if (!this.map) return

    if (this.aggregationPopupId === aggregation.key) return

    const store: TopHap.StoreState = this.context.store.getState()
    const { properties } = store.preferences.map

    const container = document.createElement('div')
    ReactDOM.render(
      <AggregationPopup
        color={color}
        colorAverage={formatPropertyMetric(
          properties.color,
          aggregation[properties.color]
        )}
        colorMetric={propertyData[properties.color].title}
        count={aggregation.count}
        radiusAverage={formatPropertyMetric(
          properties.color,
          aggregation[properties.radius]
        )}
        radiusMetric={propertyData[properties.radius].title}
      />,
      container
    )

    const popup = this._newPopup(multiEnabled)
    popup.type = 'Aggregation'

    popup
      .setLngLat(aggregation.location)
      .setDOMContent(container)
      .addTo(this.map)

    this.aggregationPopupId = aggregation.key
  }

  showPropertyPopup = (
    property: TopHap.Property | string,
    location: MapboxGL.LngLatLike,
    multiEnabled = false
  ) => {
    if (!property) return
    if (!this.map) return

    const store: TopHap.StoreState = this.context.store.getState()

    if (store.ui.viewport.width <= BREAK_SM) {
      this.setState({ property })
      return
    }

    const id = typeof property === 'string' ? property : property.id

    if (this.propertyPopupId === id) return

    const { isMobile } = store.global

    const container = document.createElement('div')
    ReactDOM.render(
      <div className='th-property-card-wrapper'>
        <PropertyCard
          autoPlay
          isMobile={isMobile.any}
          property={property}
          rentalEstimate={store.preferences.filter.rental}
          lazyload
          mini
        />
        {isMobile.any && (
          <Button
            className='th-close-button'
            hitSlop
            onClick={this.closePropertyPopup}
          >
            <CloseIcon />
          </Button>
        )}
      </div>,
      container
    )

    const popup = this._newPopup(multiEnabled, { maxWidth: 'none' })
    popup.type = 'Property'

    popup
      .setLngLat(location)
      .setDOMContent(container)
      .addTo(this.map)

    this.propertyPopupId = id
  }

  showParcelPopup = debounce(feature => {
    const store: TopHap.StoreState = this.context.store.getState()
    if (store.global.isMobile.phone) {
      this.setState({ property: String(feature.id) })
    } else {
      this.showPropertyPopup(String(feature.id), feature.geometry.coordinates)
    }
  }, 100)

  showAnalyticsPopup = (
    item: TopHap.AnalyticsDescriptive,
    color: string,
    multiEnabled = false
  ) => {
    if (!item) return
    if (!this.map) return

    if (item.key === this.analyticsPopupId) return

    const store: TopHap.StoreState = this.context.store.getState()
    const { descriptive } = store.preferences.map

    let data = item.data
    if (descriptive.metric === 'unique_zones') {
      if (!store.preferences.map.uniqueZonesOptions.school) {
        data = data.filter(
          ({ type }: { type: string }) =>
            type !== 'school' && type !== 'school-district'
        )
      }
    }

    const metricData = getAnalyticsMetricData(descriptive.metric, 'aggregation')

    const container = document.createElement('div')
    ReactDOM.render(
      <AnalyticsPopup
        color={color}
        count={item.doc_count}
        data={data}
        metric={descriptive.metric}
        meta={metricData}
        value={formatAnalyticsMetric(
          descriptive.metric,
          item.metric,
          'aggregation'
        )}
      />,
      container
    )

    const popup = this._newPopup(multiEnabled)
    popup.type = 'Analytics'

    const center = h3ToGeo(item.key)

    popup
      .setLngLat([center[1], center[0]])
      .setDOMContent(container)
      .addTo(this.map)

    this.analyticsPopupId = item.key
  }

  showAnalyticsParcelPopup = (
    item: TopHap.AnalyticsDescriptiveParcel,
    color: string,
    location: MapboxGL.LngLatLike,
    multiEnabled = false
  ) => {
    if (!item) return
    if (!this.map) return

    if (item.id === this.analyticsPopupId) {
      const popup = this.popups[this.popups.length - 1]
      if (popup) {
        popup.setLngLat(location)
      }
    }

    const store: TopHap.StoreState = this.context.store.getState()
    const { descriptive } = store.preferences.map

    let data = item.data
    if (descriptive.metric === 'unique_zones') {
      if (!store.preferences.map.uniqueZonesOptions.school) {
        data = data.filter(
          ({ type }: { type: string }) =>
            type !== 'school' && type !== 'school-district'
        )
      }
    }

    const metricData = getAnalyticsMetricData(descriptive.metric, 'parcel')

    const container = document.createElement('div')
    ReactDOM.render(
      <AnalyticsPopup
        color={color}
        data={data}
        metric={descriptive.metric}
        meta={metricData}
        value={formatAnalyticsMetric(descriptive.metric, item.value, 'parcel')}
      />,
      container
    )

    const popup = this._newPopup(multiEnabled, { anchor: 'top' })
    popup.type = 'Analytics'

    popup
      .setLngLat(location)
      .setDOMContent(container)
      .addTo(this.map)

    this.analyticsPopupId = item.id
  }

  showElevationPopup = (
    id: string,
    alt: number,
    location: mapboxgl.LngLat,
    multiEnabled = false
  ) => {
    if (!this.map) return

    if (id === this.elevationPopupId) return

    const container = document.createElement('div')
    ReactDOM.render(<ElevationPopup alt={alt} />, container)

    const popup = this._newPopup(multiEnabled)
    popup.type = 'Elevation'

    popup
      .setLngLat(location)
      .setDOMContent(container)
      .addTo(this.map)

    this.elevationPopupId = id
  }

  onLoad = () => {
    this.styleLoad$.next(true)
  }

  onClick = (
    ev: (mapboxgl.MapMouseEvent | mapboxgl.MapTouchEvent) & mapboxgl.EventData
  ) => {
    if (!this.map) return

    const features = this.map.queryRenderedFeatures(ev.point, {
      layers: [
        this.model.circleLayer?.id,
        this.model.propertiesLayer?.id,
        this.model.parcelFillLayer.id
      ] as string[]
    })

    // handle only the topmost rendered feature
    if (!features.length) {
      // this.zoomToPreset(ev)
      return
    }
    const feature = features[0]

    if (
      feature.layer.id === this.model.circleLayer?.id ||
      feature.layer.id === this.model.propertiesLayer?.id
    ) {
      this.handlePropertiesLayerClick(ev, feature)
    } else if (feature.layer.id === this.model.parcelFillLayer.id) {
      this.handleParcelFillLayerClick(ev, feature)
    }
  }

  onTouchStart = (ev: mapboxgl.MapTouchEvent & mapboxgl.EventData) => {
    this.touchStart = ev.point
  }

  onTouchEnd = (ev: mapboxgl.MapTouchEvent & mapboxgl.EventData) => {
    if (!this.touchStart) this.touchStart = ev.point
    const x = ev.point.x - this.touchStart.x
    const y = ev.point.y - this.touchStart.y
    const tolerance = 25 * 25
    if (x * x + y * y < tolerance) {
      this.handlePopups(ev)
      this.onClick(ev)
    }
  }

  viewDetail = (property: TopHap.Property | string) => {
    this.removePopups()
    const store: TopHap.StoreState = this.context.store.getState()
    if (store.ui.viewport.width <= BREAK_SM) {
      if (typeof property === 'string') {
        Router.push(
          '/homes/details/[address]/[id]',
          `/homes/details/parcels/${property}`
        )
      } else {
        Router.push(
          '/homes/details/[address]/[id]',
          propertiesUtils.viewUrl(property.id, property.address)
        )
      }
    } else {
      this.props.updateSider(
        'properties',
        {
          mode: 'Detail',
          id: typeof property === 'string' ? property : property.id
        },
        true
      )
      if (!store.ui.sider.visible) {
        this.props.updateSider('visible', true)
      }
    }

    this.model.setSelectedParcel(
      typeof property === 'string' ? property : property.id
    )
  }

  zoomToPreset = (e: any) => {
    if (!this.map) return

    if (this.disableZoom === 'FOREVER') return
    if (this.disableZoom === 'ONCE') {
      this.disableZoom = 'NONE'
      return
    }

    const curZoom = this.map.getZoom()
    if (curZoom >= ZOOM_PRESETS[ZOOM_PRESETS.length - 1]) return

    // disable if there are opened Popovers
    if (Popover.popovers.length) return

    // disable if preview is open on mobile
    if (this.state.property) return

    const excludeLayers = [
      this.model.circleLayer?.id,
      this.model.listingsLayer?.id
    ]

    // if a popup is up, prevent zooming
    const features = this.map.queryRenderedFeatures(e.point, {
      layers: excludeLayers
    })
    if (features.length) return

    // disable if it in out of CA
    const boundariesFeatures = this.map.queryRenderedFeatures(e.point, {
      layers: [
        'county-fills',
        'place-fills',
        'zipcode-fills',
        this.model.analyticsLayer?.id
      ] as string[]
    })
    if (!boundariesFeatures.length) return

    const zoom = ZOOM_PRESETS.find(e => e > curZoom)
    this.map.flyTo({
      center: [e.lngLat.lng, e.lngLat.lat],
      zoom,
      speed: FLY_SPEED
    })
  }

  onMoveParcelFillLayer = (
    ev: (mapboxgl.MapMouseEvent | mapboxgl.MapTouchEvent) & {
      features?: mapboxgl.MapboxGeoJSONFeature[] | undefined
    } & mapboxgl.EventData
  ) => {
    if (!this.map || !ev.features || !ev.features.length) return
    const feature = ev.features[0]

    // turn off hovered state of the old one
    if (this.hoveredParcel) {
      this.map.setFeatureState(this.hoveredParcel, { hover: false })
    }

    // turn on hovered state of the parcel and save it
    this.hoveredParcel = {
      id: feature.id,
      source: feature.source,
      sourceLayer: feature.sourceLayer
    }
    this.map.setFeatureState(this.hoveredParcel, { hover: true })

    this.map.getCanvas().style.cursor = 'pointer'
  }

  onLeaveParcelFillLayer = () => {
    // turn off hovered state if there is hovered one.
    if (this.hoveredParcel) {
      this.map?.setFeatureState(this.hoveredParcel, { hover: false })
      this.hoveredParcel = undefined
    }

    if (this.map) this.map.getCanvas().style.cursor = ''
  }

  onTouchEndParcelFillLayer = (
    ev: (mapboxgl.MapMouseEvent | mapboxgl.MapTouchEvent) & {
      features?: mapboxgl.MapboxGeoJSONFeature[] | undefined
    } & mapboxgl.EventData
  ) => {
    if (!this.touchStart) this.touchStart = ev.point
    const x = ev.point.x - this.touchStart.x
    const y = ev.point.y - this.touchStart.y
    const tolerance = 25 * 25
    if (x * x + y * y < tolerance) {
      this.onMoveParcelFillLayer(ev)
    }
  }

  onMouseMove = (ev: mapboxgl.MapMouseEvent & mapboxgl.EventData) => {
    if (ev.originalEvent.buttons) {
      return
    }

    this.handlePopups(ev)
  }

  onMouseOut = debounce(() => {
    this.removePopups()
  }, 100)

  onMoveEnd = (
    ev: mapboxgl.MapboxEvent<MouseEvent | TouchEvent | WheelEvent | undefined> &
      mapboxgl.EventData
  ) => {
    if (ev.preview) return

    // prevent map resizing/moving when scrolling result list on mobile.
    // but allow it at the first time (!initialized) to set bounds correctly.
    if (this.initialized) {
      const store: TopHap.StoreState = this.context.store.getState()
      if (store.ui.sider.visible && store.ui.viewport.width <= BREAK_SM) {
        return
      }
    }

    const map = this.map as mapboxgl.Map
    const container = map.getContainer()
    const zoom = map.getZoom()
    const center = map.getCenter().toArray()
    const bounds = map.getBounds().toArray()
    const padding = map.getPadding()

    const width = bounds[1][0] - bounds[0][0]
    const height = bounds[1][1] - bounds[0][1]

    this.props.setMapOption(
      'viewport',
      {
        zoom,
        center,
        bearing: map.getBearing(),
        pitch: map.getPitch(),
        bounds: [
          [
            bounds[0][0] + (width / container.clientWidth) * padding.left,
            bounds[0][1] + (height / container.clientHeight) * padding.top
          ],
          [
            bounds[1][0] - (width / container.clientWidth) * padding.right,
            bounds[1][1] - (height / container.clientHeight) * padding.bottom
          ]
        ],
        // bounds,
        updatedBy: 'MAP'
      },
      true
    )
  }

  onZoomStart = () => {
    this.removePopups()
  }

  onZoomEnd = () => {
    const zoom = this.map?.getZoom() as number

    // print zoom for debug purpose
    if (process.env.NODE_ENV === 'development') {
      console.log(`%c${zoom}`, 'color: #40a9ff')
    }

    logEvent('map', 'zoom_change', null, { zoom: Math.round(zoom) })
  }

  _showDrawTrash = (visible: boolean) => {
    const trashElement = document.querySelector(
      '.mapbox-gl-draw_ctrl-draw-btn.mapbox-gl-draw_trash'
    ) as HTMLDivElement

    if (trashElement) {
      trashElement.style.display = visible ? 'block' : 'none'
    }
  }

  onDrawCreate = (ev: any) => {
    // make sure of having the same start/end point
    const coordinates = ev.features[0].geometry.coordinates[0]
    if (
      coordinates[0][0] !== coordinates[coordinates.length - 1][0] ||
      coordinates[0][1] !== coordinates[coordinates.length - 1][1]
    ) {
      coordinates.push(coordinates[0])
    }

    this.props.addDrawing(ev.features[0])
  }

  onDrawUpdate = (ev: any) => {
    if (ev.features.length) {
      this.props.updateDrawing(ev.features[0])
    }
  }

  onDrawDelete = (ev: any) => {
    this.props.removeDrawing(ev.features[0])

    this._showDrawTrash(false)
  }

  onDrawModeChange = (ev: any) => {
    if (ev.mode === 'draw_polygon') {
      this.disableZoom = 'FOREVER'
    } else {
      this.disableZoom = 'NONE'
    }
  }

  onDrawSelectionChange = (ev: any) => {
    this._showDrawTrash(ev.features.length)
    this.disableZoom = 'ONCE'
  }

  onResize = () => {
    if (this.map) {
      this.map.resize()
    }
  }

  updateMapForPreview = (updates: mapboxgl.CameraOptions) => {
    this.map?.jumpTo(updates, { preview: true })
  }

  render() {
    const { property } = this.state

    return (
      <>
        <div id='th-map' className='th-map' />

        {property && (
          <div
            className='th-property-preview-container'
            onClick={() => this.viewDetail(property)}
          >
            <PropertyCard
              isMobile
              property={property}
              lazyload
              mini
              rentalEstimate={this.props.rentalEstimate}
            />
            <Button
              className='th-close-button'
              hitSlop
              onClick={this.closePropertyPopup}
            >
              <CloseIcon />
            </Button>
          </div>
        )}
        <RotationControl updateMapForPreview={this.updateMapForPreview} />

        <ResizeDetector
          handleWidth
          onResize={this.onResize}
          refreshMode='debounce'
          refreshRate={50}
        />

        <style jsx>{styles}</style>
      </>
    )
  }
}

Map.contextType = ReactReduxContext
