import ReactDOM from 'react-dom'
import * as turf from '@turf/turf'
import * as d3Array from 'd3-array'
import * as d3Color from 'd3-color'
import * as d3Scale from 'd3-scale'
import * as d3Interpolate from 'd3-interpolate'
import * as H3 from 'h3-js'
import MapboxGL from 'mapbox-gl'

import imgAppIcon from 'assets/images/pin/app-icon.png'
import {
  MAP_SWITCHING_ZOOM_LEVEL,
  PARCEL_MARKER_ZOOM_LEVEL,
  REGION_TYPES
} from 'consts'
import {
  DEFAULT_MIN_PERCENTILE_PARCEL,
  DEFAULT_MAX_PERCENTILE_PARCEL,
  DEFAULT_MIN_PERCENTILE_AGGREGATION,
  DEFAULT_MAX_PERCENTILE_AGGREGATION,
  formatAnalyticsMetric,
  formatPropertyMetric,
  getAnalyticsMetricData
} from 'consts/data_mapping'

export enum LayerType {
  Boundary = 'boundary',
  Properties = 'properties',
  Parcels = 'parcels',
  Analytics = 'analytics',
  Zones = 'zones',
  Elevation = 'elevation'
}

type Source = {
  id: string
  source: {
    type: 'geojson'
    data: GeoJSON.FeatureCollection<GeoJSON.Geometry>
  }
}

export default class MapModel {
  map?: mapboxgl.Map
  includes?: LayerType[]

  circleLayer?: mapboxgl.Layer
  propertiesLayer?: mapboxgl.Layer
  elevationLayer?: mapboxgl.Layer
  parcelTitleLayer?: mapboxgl.Layer
  parcelDimensionLayer?: mapboxgl.Layer
  analyticsLayer?: mapboxgl.Layer
  boundaryLayer?: mapboxgl.Layer

  circleSource?: Source
  propertiesSource?: Source
  parcelPositionSource?: Source
  elevationSource?: Source
  parcelDimensionSource?: Source
  analyticsSource?: Source
  boundarySource?: Source

  markers = {} as {
    [eleName: string]: mapboxgl.Marker
  }
  parcelMarkers = {} as {
    [eleName: string]: any
  };

  [eleName: string]: any

  constructor(map?: mapboxgl.Map, includes?: LayerType[]) {
    this.map = map
    this.includes = includes
    this.initLayerData()
  }

  setMap = (map?: mapboxgl.Map) => {
    this.map = map
  }

  initLayerData = () => {
    const includes = this.includes

    this.parcelFillLayer = {
      id: 'parcel_fills',
      source: 'composite',
      sourceLayer: 'shapes'
    }

    this.parcelOutlineLayer = {
      id: 'parcel_outlines',
      source: 'composite',
      sourceLayer: 'shapes'
    }

    if (!includes || includes.includes(LayerType.Properties)) {
      // layer for property symbols
      this.propertiesSource = {
        id: 'properties',
        source: {
          type: 'geojson',
          data: {
            type: 'FeatureCollection',
            features: []
          }
        }
      }

      this.propertiesLayer = {
        id: 'properties-layer',
        type: 'symbol',
        source: this.propertiesSource.id,
        paint: {
          'text-color': '#fff'
        },
        layout: {
          'icon-allow-overlap': true,
          'icon-anchor': 'bottom',
          'icon-ignore-placement': true,
          'icon-image': '{pin}',
          'text-field': '{label}',
          'text-justify': 'center',
          'text-anchor': 'center',
          'text-transform': 'uppercase',
          'text-size': 12,
          'text-offset': ['get', 'offset'],
          'text-font': ['Open Sans Semibold', 'Arial Unicode MS Bold'],
          visibility: 'none'
        }
      }

      // layer for property dots
      this.circleSource = {
        id: 'circle-layer-source',
        source: {
          type: 'geojson',
          data: {
            type: 'FeatureCollection',
            features: []
          }
        }
      }

      this.circleLayer = {
        id: 'circle-layer',
        type: 'circle',
        source: this.circleSource.id,
        paint: {
          'circle-color': ['get', 'fill'],
          'circle-opacity': ['get', 'opacity'],
          'circle-stroke-color': '#ffffff',
          'circle-stroke-width': [
            'interpolate',
            ['linear'],
            ['zoom'],
            8,
            1,
            10,
            1,
            16,
            2
          ],
          'circle-radius': [
            'interpolate',
            ['linear'],
            ['zoom'],
            6,
            ['*', 0.3, ['get', 'radius']],
            8,
            ['*', 0.3, ['get', 'radius']],
            10,
            ['*', 0.3, ['get', 'radius']],
            14,
            ['*', 0.6, ['get', 'radius']],
            22,
            ['*', 1, ['get', 'radius']]
          ]
        },
        layout: {
          visibility: 'none'
        }
      }
    }

    if (!includes || includes.includes(LayerType.Parcels)) {
      // parcel layer
      this.parcelPositionSource = {
        id: 'parcel-position-source',
        source: {
          type: 'geojson',
          data: {
            type: 'FeatureCollection',
            features: []
          }
        }
      }

      this.parcelMarkerLayer = {
        id: 'parcel_centroids'
      }

      this.parcelTitleLayer = {
        id: 'parcel-title-layer',
        type: 'symbol',
        minzoom: PARCEL_MARKER_ZOOM_LEVEL, // min zoom value for showing this layer
        source: this.parcelPositionSource.id,
        filter: ['has', 'label'],
        paint: {
          'text-color': '#fff',
          'text-halo-color': '#111',
          'text-halo-width': 1,
          'text-halo-blur': 0.2
        },
        layout: {
          'icon-allow-overlap': true,
          'text-field': '{label}',
          'text-anchor': 'top',
          'text-size': 13,
          'text-offset': [0, 0.2],
          'text-font': ['Open Sans Semibold', 'Arial Unicode MS Bold'],
          'text-padding': 4,
          visibility: 'none'
        }
      }
    }

    if (!includes || includes.includes(LayerType.Boundary)) {
      // this is for region boundary
      this.boundarySource = {
        id: 'boundary-source',
        source: {
          type: 'geojson',
          data: {
            type: 'FeatureCollection',
            features: []
          }
        }
      }

      this.boundaryLayer = {
        id: 'boundary-layer',
        type: 'line',
        source: this.boundarySource.id,
        paint: {
          'line-color': '#6651f5',
          'line-width': 2
        },
        layout: {
          visibility: 'none'
        }
      }
    }

    if (!includes || includes.includes(LayerType.Analytics)) {
      // analytics descriptive layer
      this.analyticsSource = {
        id: 'analytics-descriptive-source',
        source: {
          type: 'geojson',
          data: {
            type: 'FeatureCollection',
            features: []
          }
        }
      }

      this.analyticsLayer = {
        id: 'analytics-descriptive-layer',
        type: 'fill',
        source: this.analyticsSource.id,
        maxzoom: MAP_SWITCHING_ZOOM_LEVEL,
        paint: {
          'fill-color': ['get', 'fill'],
          /* 'fill-outline-color': 'white', */
          'fill-opacity': 0.9
        },
        layout: {
          visibility: 'none'
        }
      }
    }

    if (!includes || includes.includes(LayerType.Zones)) {
      // zone layers
      this.zoneSource = {
        id: 'zone-source',
        source: {
          type: 'geojson',
          data: {
            type: 'FeatureCollection',
            features: []
          }
        }
      }

      this.schoolLayer = {
        id: 'school-layer',
        type: 'line',
        source: this.zoneSource.id,
        paint: {
          'line-color': ['get', 'color'],
          'line-width': 2
        },
        layout: {
          visibility: 'none'
        }
      }

      this.placeLayers = ['place-labels', 'place-fills', 'places']
      this.zipLayers = ['zipcode-labels', 'zipcode-fills', 'zipcodes']
      this.countyLayers = ['county-labels', 'county-fills', 'counties']
    }

    if (!includes || includes.includes(LayerType.Elevation)) {
      // elevation h3 layer
      this.elevationSource = {
        id: 'elevation-source',
        source: {
          type: 'geojson',
          data: {
            type: 'FeatureCollection',
            features: []
          }
        }
      }

      this.elevationLayer = {
        id: 'elevation-layer',
        type: 'fill-extrusion',
        source: this.elevationSource.id,
        minzoom: MAP_SWITCHING_ZOOM_LEVEL,
        paint: {
          'fill-extrusion-color': ['get', 'fill'],
          'fill-extrusion-opacity': 0.8,
          'fill-extrusion-height': ['get', 'height'],
          'fill-extrusion-base': ['get', 'base']
        },
        layout: {
          visibility: 'none'
        }
      }

      // parcel dimension
      this.parcelDimensionSource = {
        id: 'parcel-dimension-source',
        source: {
          type: 'geojson',
          data: {
            type: 'FeatureCollection',
            features: []
          }
        }
      }

      // parcel dimension layer
      this.parcelDimensionLayer = {
        id: 'parcel-dimension-layer',
        type: 'symbol',
        minzoom: PARCEL_MARKER_ZOOM_LEVEL, // min zoom value for showing this layer
        source: this.parcelDimensionSource.id,
        paint: {
          'text-color': '#fff',
          'text-halo-color': '#333',
          'text-halo-width': 1,
          'text-halo-blur': 0.2
        },
        layout: {
          'icon-allow-overlap': true,
          'text-field': '{length} ft',
          'text-size': 11,
          'text-font': ['Open Sans Semibold', 'Arial Unicode MS Bold'],
          'text-padding': 4,
          visibility: 'none'
        }
      }
    }
  }

  initMapStyle = (options: TopHap.PreferencesState) => {
    if (!this.map) return
    const includes = this.includes

    const layers = this.map.getStyle().layers as mapboxgl.Layer[]
    let firstLineId, firstSymbolId
    for (let i = 0; i < layers.length; ++i) {
      if (
        layers[i].type === 'line' &&
        (!this.parcelOutlineLayer ||
          layers[i].id !== this.parcelOutlineLayer.id)
      ) {
        firstLineId = layers[i].id
        break
      }
    }

    for (let i = layers.length - 1; i >= 0; --i) {
      if (layers[i].type === 'symbol' && layers[i - 1].type === 'line') {
        firstSymbolId = layers[i].id
        break
      }
    }

    if (!includes || includes.includes(LayerType.Elevation)) {
      // elevation layer
      if (
        this.elevationSource &&
        this.elevationLayer &&
        !this.map.getLayer(this.elevationLayer.id)
      ) {
        this.map.addSource(this.elevationSource.id, this.elevationSource.source)
        this.map.addLayer(this.elevationLayer, firstSymbolId)
      }
    }

    if (!includes || includes.includes(LayerType.Parcels)) {
      // parcel layer
      const parcelFillLayer = this.map.getLayer(this.parcelFillLayer.id)
      if (parcelFillLayer) {
        this.map.setPaintProperty(this.parcelFillLayer.id, 'fill-opacity', 0.7)
      }

      const parcelOutlineLayer = this.map.getLayer(this.parcelOutlineLayer.id)
      if (parcelOutlineLayer) {
        this.map.setPaintProperty(this.parcelOutlineLayer.id, 'line-color', [
          'case',
          ['boolean', ['feature-state', 'searched'], false],
          '#ffffff',
          ['boolean', ['feature-state', 'hover'], false],
          '#ffffff',
          ['boolean', ['feature-state', 'selected'], false],
          '#ffffff',
          ['boolean', ['feature-state', 'hoverOnList'], false],
          '#ffffff',
          '#ffffff'
        ])

        this.map.setPaintProperty(this.parcelOutlineLayer.id, 'line-width', [
          'case',
          ['boolean', ['feature-state', 'searched'], false],
          4,
          ['boolean', ['feature-state', 'hover'], false],
          2,
          ['boolean', ['feature-state', 'hoverOnList'], false],
          3,
          ['boolean', ['feature-state', 'selected'], false],
          4,
          0.5
        ])
      }

      if (
        this.parcelPositionSource &&
        this.parcelTitleLayer &&
        !this.map.getLayer(this.parcelTitleLayer.id)
      ) {
        this.map.addSource(
          this.parcelPositionSource.id,
          this.parcelPositionSource.source
        )
        this.map.addLayer(this.parcelTitleLayer, firstSymbolId)
      }
      this.showParcelLayers(options.map)
    }

    if (!includes || includes.includes(LayerType.Elevation)) {
      if (
        this.parcelDimensionSource &&
        this.parcelDimensionLayer &&
        !this.map.getLayer(this.parcelDimensionLayer.id)
      ) {
        this.map.addSource(
          this.parcelDimensionSource.id,
          this.parcelDimensionSource.source
        )
        this.map.addLayer(this.parcelDimensionLayer)
      }
      this.showElevationLayer(options.map)
    }

    if (!includes || includes.includes(LayerType.Analytics)) {
      // analytics layer
      if (
        this.analyticsSource &&
        this.analyticsLayer &&
        !this.map.getLayer(this.analyticsLayer.id)
      ) {
        this.map.addSource(this.analyticsSource.id, this.analyticsSource.source)
        this.map.addLayer(this.analyticsLayer, firstLineId) // show analytics layer under lines
        this.showAnalyticsLayer(options.map)
      }
    }

    if (!includes || includes.includes(LayerType.Boundary)) {
      if (
        this.boundarySource &&
        this.boundaryLayer &&
        !this.map.getLayer(this.boundaryLayer.id)
      ) {
        this.map.addSource(this.boundarySource.id, this.boundarySource.source)
        this.map.addLayer(this.boundaryLayer, firstSymbolId)
        this.showBoundaryLayer(options.place)
      }
    }

    if (!includes || includes.includes(LayerType.Zones)) {
      // zone layer
      if (!this.map.getLayer(this.schoolLayer.id)) {
        this.map.addSource(this.zoneSource.id, this.zoneSource.source)
        this.map.addLayer(this.schoolLayer)
      }
      this.showZoneLayer(options.map.zones)
    }

    if (!includes || includes.includes(LayerType.Properties)) {
      // properties circles layer
      if (
        this.circleSource &&
        this.circleLayer &&
        !this.map.getLayer(this.circleLayer.id)
      ) {
        this.map.addSource(this.circleSource.id, this.circleSource.source)
        this.map.addLayer(this.circleLayer, firstSymbolId)
        this.showCircleLayer(options.map)
      }

      // properties symbol layer
      if (
        this.propertiesSource &&
        this.propertiesLayer &&
        !this.map.getLayer(this.propertiesLayer.id)
      ) {
        this.map.addSource(
          this.propertiesSource.id,
          this.propertiesSource.source
        )
        this.map.addLayer(this.propertiesLayer, firstSymbolId)
        this.showPropertiesLayer(options.map)
      }
    }
  }

  showPropertiesLayer = (options: TopHap.MapPreferences) => {
    if (!this.propertiesLayer || !this.map?.getLayer(this.propertiesLayer.id))
      return

    const isVisible =
      options.properties.enabled && options.properties.labelEnabled

    this.map.setLayoutProperty(
      this.propertiesLayer.id,
      'visibility',
      isVisible ? 'visible' : 'none'
    )
  }

  showCircleLayer = (options: TopHap.MapPreferences) => {
    if (!this.circleLayer || !this.map?.getLayer(this.circleLayer.id)) return

    const isVisible = options.properties.enabled

    this.map.setLayoutProperty(
      this.circleLayer.id,
      'visibility',
      isVisible ? 'visible' : 'none'
    )
  }

  showBoundaryLayer = (place?: TopHap.Place) => {
    if (!this.boundaryLayer || !this.map?.getLayer(this.boundaryLayer.id))
      return

    const isVisible = place && REGION_TYPES.includes(place.place_type[0])

    this.map?.setLayoutProperty(
      this.boundaryLayer.id,
      'visibility',
      isVisible ? 'visible' : 'none'
    )
  }

  showAnalyticsLayer = (map: TopHap.MapPreferences) => {
    if (!this.analyticsLayer || !this.map?.getLayer(this.analyticsLayer.id))
      return

    this.map.setLayoutProperty(
      this.analyticsLayer.id,
      'visibility',
      map.descriptive.enabled && !map.elevations ? 'visible' : 'none'
    )

    if (map.properties.enabled) {
      this.map.setPaintProperty(this.analyticsLayer.id, 'fill-opacity', 0.7)
    } else {
      this.map.setPaintProperty(this.analyticsLayer.id, 'fill-opacity', 0.9)
    }
  }

  showParcelLayers = (map: TopHap.MapPreferences) => {
    if (this.map?.getLayer(this.parcelFillLayer.id)) {
      if (map.descriptive.enabled && !map.elevations) {
        this.map.setPaintProperty(this.parcelFillLayer.id, 'fill-color', [
          'string',
          ['feature-state', 'color'],
          'transparent'
        ])
      } else {
        this.map.setPaintProperty(
          this.parcelFillLayer.id,
          'fill-color',
          'transparent'
        )
      }
    }

    if (this.parcelTitleLayer && this.map?.getLayer(this.parcelTitleLayer.id)) {
      this.map.setLayoutProperty(
        this.parcelTitleLayer.id,
        'visibility',
        map.descriptive.enabled && !map.elevations ? 'visible' : 'none'
      )
    }
  }

  showElevationLayer = (map: TopHap.MapPreferences) => {
    if (!this.elevationLayer || !this.map?.getLayer(this.elevationLayer.id))
      return

    const isVisible = map.elevations

    this.map.setLayoutProperty(
      this.elevationLayer.id,
      'visibility',
      isVisible ? 'visible' : 'none'
    )

    if (this.parcelDimensionLayer) {
      this.map.setLayoutProperty(
        this.parcelDimensionLayer.id,
        'visibility',
        isVisible ? 'visible' : 'none'
      )
    }
  }

  showZoneLayer = (options: TopHap.MapPreferences['zones']) => {
    this.zipLayers.forEach((layerId: string) => {
      this.map?.setLayoutProperty(
        layerId,
        'visibility',
        options.zip ? 'visible' : 'none'
      )
    })

    this.placeLayers.forEach((layerId: string) => {
      this.map?.setLayoutProperty(
        layerId,
        'visibility',
        options.place ? 'visible' : 'none'
      )
    })

    this.countyLayers.forEach((layerId: string) => {
      this.map?.setLayoutProperty(
        layerId,
        'visibility',
        options.county ? 'visible' : 'none'
      )
    })

    this.map?.setLayoutProperty(
      this.schoolLayer.id,
      'visibility',
      options.school ? 'visible' : 'none'
    )
  }

  updateCircleSource = (
    properties: TopHap.PropertiesState,
    preferences: TopHap.PreferencesState,
    isPropertyMode: boolean
  ) => {
    if (!this.circleSource) return
    const { source } = this.circleSource
    const { map, aggregations } = properties
    const { properties: propertyOptions } = preferences.map
    let { radius } = propertyOptions

    if (isPropertyMode) {
      radius = radius === 'count' ? 'LivingSqft' : radius
    }

    const items = (isPropertyMode
      ? map.items
      : aggregations.items) as TopHap.PropertyBase[]

    const colors = ['#0f0', '#0ff', '#00f', '#f0f', '#f00']

    const colorValues = items.map(e => e[propertyOptions.color])
    colorValues.sort((a, b) => a - b)

    const minPercentileColor = d3Array.quantile(colorValues, 0.01)
    const maxPercentileColor = d3Array.quantile(colorValues, 0.99)

    const evenColorSegmentValues = (colorValues: number[], count: number) => {
      const results = []
      results.push(minPercentileColor)
      for (let i = 1; i < count - 1; i++) {
        results.push(
          Math.round(
            colorValues[Math.round((colorValues.length * i) / (count - 1))]
          )
        )
      }
      results.push(maxPercentileColor)
      return results as any[]
    }

    const value2Color = d3Scale
      .scaleLinear()
      .domain(evenColorSegmentValues(colorValues, colors.length))
      // @ts-ignore
      .range(colors)
      .interpolate(d3Interpolate.interpolateHcl)
      .clamp(true)

    // value2Radius
    const radiuses = []
    for (let i = 5; i <= 30; ++i) {
      radiuses.push(i)
    }

    const radiusValues = items
      .filter(e => e[radius] !== 0 && !isNaN(e[radius]))
      .map(e => e[radius])

    radiusValues.sort((a, b) => a - b)

    const minPercentileRadius = d3Array.quantile(radiusValues, 0.01)
    const maxPercentileRadius = d3Array.quantile(radiusValues, 0.99)

    const evenRadiusSegmentValues = (colorValues: number[], count: number) => {
      const results = []
      results.push(minPercentileRadius)
      for (let i = 1; i < count - 1; i++) {
        results.push(
          Math.round(
            colorValues[Math.round((colorValues.length * i) / (count - 1))]
          )
        )
      }
      results.push(maxPercentileRadius)
      return results as any[]
    }

    const value2Radius = d3Scale
      .scaleLog()
      .domain(evenRadiusSegmentValues(radiusValues, 6))
      .range(isPropertyMode ? [5, 9, 13, 17, 21, 25] : [10, 18, 26, 34, 42, 50])
      .interpolate(d3Interpolate.interpolateNumber)
    // .clamp(true)

    source.data.features = items.map((e: any, index) => {
      return {
        type: 'Feature',
        geometry: {
          type: 'Point',
          coordinates: e.location
        },
        properties: {
          id: e.id,
          key: e.key,
          index,
          fill: propertyOptions.colorEnabled
            ? value2Color(e[propertyOptions.color])
            : '#000000',
          opacity: propertyOptions.colorEnabled ? 1 : 0.65,
          radius: propertyOptions.radiusEnabled
            ? value2Radius(e[radius]) + 2
            : 10
        }
      }
    })

    const mapSource = this.map?.getSource(
      this.circleSource?.id
    ) as mapboxgl.GeoJSONSource
    if (mapSource) {
      mapSource.setData(source.data)
    }
  }

  updatePropertiesSource = (
    properties: TopHap.PropertiesState,
    preferences: TopHap.PreferencesState,
    isPropertyMode: boolean
  ) => {
    if (!this.propertiesSource) return
    const { source } = this.propertiesSource
    const { map, aggregations } = properties
    let label = preferences.map.properties.label

    if (isPropertyMode) {
      label = label === 'count' ? 'Price' : label
    }

    // TODO: properties
    if (isPropertyMode) {
      source.data.features = map.items.map((property, index) => ({
        type: 'Feature',
        geometry: {
          type: 'Point',
          coordinates: property.location
        },
        properties: {
          id: property.id,
          index,
          label: formatPropertyMetric(label, property[label]),
          pin: `property-pin-${property.TophapStatus.toLowerCase()}`,
          offset: [0, -1.35]
        }
      }))
    } else {
      source.data.features = aggregations.items.map((aggregation, index) => {
        return {
          type: 'Feature',
          geometry: {
            type: 'Point',
            coordinates: aggregation.location
          },
          properties: {
            key: aggregation.key,
            index,
            label: formatPropertyMetric(label, aggregation[label]),
            offset: [0, 0]
          }
        }
      })
    }

    const mapSource = this.map?.getSource(
      this.propertiesSource.id
    ) as mapboxgl.GeoJSONSource
    if (mapSource) {
      mapSource.setData(source.data)
    }
  }

  updateBoundarySource = (boundary: GeoJSON.Geometry[]) => {
    if (!this.boundarySource) return
    const { source } = this.boundarySource

    source.data.features = boundary.map((geometry, index) => {
      return {
        type: 'Feature',
        geometry: geometry,
        properties: {
          index
        }
      }
    })

    // update layer source on map
    const mapSource = this.map?.getSource(
      this.boundarySource.id
    ) as mapboxgl.GeoJSONSource
    if (mapSource) {
      mapSource.setData(source.data)
    }
  }

  _stringArray2IndexObject = (array: string[]) => {
    const result: {
      [eleName: string]: number
    } = {}
    let index = 0

    array.forEach(e => {
      if (result[e] === undefined) {
        result[e] = index
        ++index
      }
    })

    return result
  }

  updateAnalyticsSource = (
    properties: TopHap.PropertiesState,
    preferences: TopHap.PreferencesState
  ) => {
    if (!this.analyticsSource) return
    const { source } = this.analyticsSource

    const { descriptive } = properties
    const { metric } = preferences.map.descriptive
    const colorValues = descriptive.items.map(e => e.metric)
    const metricData = getAnalyticsMetricData(metric, 'aggregation')

    let minPercentileColor, maxPercentileColor
    let mapping: {
      [eleName: string]: number
    }
    if (
      metric === 'property_use' ||
      metric === 'unique_zones' ||
      metric === 'zoned_code'
    ) {
      mapping = this._stringArray2IndexObject(colorValues as string[])
      const values = colorValues.map(e => mapping[e])
      values.sort((a, b) => a - b)
      minPercentileColor = values[0]
      maxPercentileColor = values[values.length - 1]
    } else {
      const values = colorValues as number[]
      values.sort((a, b) => a - b)
      minPercentileColor = d3Array.quantile(
        values,
        metricData.minPercentile || DEFAULT_MIN_PERCENTILE_AGGREGATION
      )
      maxPercentileColor = d3Array.quantile(
        values,
        metricData.maxPercentile || DEFAULT_MAX_PERCENTILE_AGGREGATION
      )
    }

    const cool = d3Interpolate.interpolateCubehelixLong(
      d3Color.cubehelix(260, 0.75, 0.35),
      d3Color.cubehelix(80, 1.5, 0.8)
    )

    const value2Color = d3Scale
      // @ts-ignore
      .scaleSequential()
      .domain([maxPercentileColor, minPercentileColor])
      .interpolator(cool)
      .clamp(true)

    source.data.features = descriptive.items.map((e, index) => ({
      type: 'Feature',
      geometry: {
        type: 'Polygon',
        coordinates: [H3.h3ToGeoBoundary(e.key, true)]
      },
      properties: {
        index,
        fill: value2Color(mapping ? mapping[e.metric] : e.metric)
      }
    }))

    const mapSource = this.map?.getSource(
      this.analyticsSource.id
    ) as mapboxgl.GeoJSONSource
    if (mapSource) {
      mapSource.setData(source.data)
    }
  }

  updateParcelSources = (
    oldItems: TopHap.AnalyticsDescriptiveParcel[],
    newItems: TopHap.AnalyticsDescriptiveParcel[],
    map: TopHap.MapPreferences
  ) => {
    if (!this.map) return

    // reset color of old parcels
    if (this.parcelFillLayer.source) {
      oldItems.forEach(e => {
        this.map?.setFeatureState(
          {
            id: Number(e.id),
            source: this.parcelFillLayer.source,
            sourceLayer: this.parcelFillLayer.sourceLayer
          },
          { color: undefined }
        )
      })
    }

    // color new parcels
    const colorValues = newItems
      .filter(e => e.value !== undefined && e.value !== 0)
      .map(e => e.value)

    let minPercentileColor, maxPercentileColor
    let mapping: {
      [eleName: string]: number
    }
    const metricData = getAnalyticsMetricData(map.descriptive.metric, 'parcel')

    if (
      map.descriptive.metric === 'owner_occupied' ||
      map.descriptive.metric === 'pool' ||
      map.descriptive.metric === 'property_use' ||
      map.descriptive.metric === 'unique_zones' ||
      map.descriptive.metric === 'zoned_code'
    ) {
      mapping = this._stringArray2IndexObject(colorValues as string[])
      const values = colorValues.map(e => mapping[e])
      values.sort((a, b) => a - b)
      minPercentileColor = values[0]
      maxPercentileColor = values[values.length - 1]
    } else {
      const values = colorValues as number[]
      values.sort((a, b) => a - b)
      minPercentileColor = d3Array.quantile(
        values,
        metricData.minPercentile || DEFAULT_MIN_PERCENTILE_PARCEL
      )
      maxPercentileColor = d3Array.quantile(
        values,
        metricData.maxPercentile || DEFAULT_MAX_PERCENTILE_PARCEL
      )
    }

    const cool = d3Interpolate.interpolateCubehelixLong(
      d3Color.cubehelix(260, 0.75, 0.35),
      d3Color.cubehelix(80, 1.5, 0.8)
    )
    const value2Color = d3Scale
      // @ts-ignore
      .scaleSequential()
      .domain([maxPercentileColor, minPercentileColor])
      .interpolator(cool)
      .clamp(true)

    if (this.parcelFillLayer.source) {
      newItems.forEach((e, index) => {
        this.map?.setFeatureState(
          {
            id: Number(e.id),
            source: this.parcelFillLayer.source,
            sourceLayer: this.parcelFillLayer.sourceLayer
          },
          {
            color: e.value
              ? value2Color(mapping ? mapping[e.value] : e.value)
              : 'transparent',
            index
          }
        )
      })
    }

    const positionLayer = this.map?.getLayer(this.parcelMarkerLayer.id)
    if (!positionLayer) return

    const features = newItems.length
      ? this.map.querySourceFeatures(positionLayer.source as string, {
          // @ts-ignore
          sourceLayer: positionLayer.sourceLayer,
          filter: [
            'match',
            ['id'],
            newItems.map(e => Number(e.id)),
            true,
            false
          ]
        })
      : []

    if (!this.parcelPositionSource) return

    const { source: positionSource } = this.parcelPositionSource
    positionSource.data.features = features.map(
      (e: mapboxgl.MapboxGeoJSONFeature) => {
        const parcel = newItems.find(p => Number(p.id) === e.id)
        const value = Number(parcel?.value)

        return {
          id: e.id,
          type: 'Feature',
          geometry: e.geometry,
          properties: {
            label:
              map.descriptive.metric === 'owner_occupied' ||
              map.descriptive.metric === 'pool' ||
              map.descriptive.metric === 'property_use' ||
              map.descriptive.metric === 'unique_zones' ||
              map.descriptive.metric === 'zoned_code'
                ? undefined
                : value
                ? formatAnalyticsMetric(map.descriptive.metric, value, 'parcel')
                : undefined,
            color: value ? value2Color(value) : 'transparent'
          }
        }
      }
    )

    const mapPositionSource = this.map?.getSource(
      this.parcelPositionSource.id
    ) as mapboxgl.GeoJSONSource
    if (mapPositionSource) {
      mapPositionSource.setData(positionSource.data)
    }
  }

  updateElevationSource = (elevations: TopHap.Elevation[]) => {
    if (!this.elevationSource) return
    const { source } = this.elevationSource
    const map = this.map as mapboxgl.Map

    const altValues = elevations
      .map(e => e.elevations)
      .flat()
      .map(e => e.alt)

    altValues.sort((a, b) => a - b)

    const minPercentileHeight = d3Array.quantile(altValues, 0.01) as number
    const maxPercentileHeight = d3Array.quantile(altValues, 0.99) as number

    const value2Height = d3Scale
      .scaleLinear()
      .domain([minPercentileHeight, maxPercentileHeight])
      .range([0, altValues[altValues.length - 1] - altValues[0]])
      .interpolate(d3Interpolate.interpolateNumber)
      .clamp(true)

    const items = elevations.map(e => {
      const items = e.elevations

      const itemAltValues = items.map(e => e.alt)

      itemAltValues.sort((a, b) => a - b)

      const minPercentileColor = d3Array.quantile(itemAltValues, 0.03)
      const maxPercentileColor = d3Array.quantile(itemAltValues, 0.97)

      const cool = d3Interpolate.interpolateCubehelixLong(
        d3Color.cubehelix(260, 0.75, 0.35),
        d3Color.cubehelix(80, 1.5, 0.8)
      )

      const value2Color = d3Scale
        // @ts-ignore
        .scaleSequential()
        .domain([maxPercentileColor, minPercentileColor])
        .interpolator(cool)
        .clamp(true)

      return items.map(
        e =>
          ({
            type: 'Feature',
            geometry: {
              type: 'Polygon',
              coordinates: [H3.h3ToGeoBoundary(e.h3, true)]
            },
            properties: {
              key: e.h3,
              fill: value2Color(e.alt),
              height: value2Height(e.alt),
              alt: e.alt
            }
          } as GeoJSON.Feature)
      )
    })

    source.data.features = items.flat()

    const mapSource = map.getSource(
      this.elevationSource.id
    ) as mapboxgl.GeoJSONSource
    if (mapSource) {
      mapSource.setData(source.data)
    }

    // update parcel dimension source
    if (!this.parcelDimensionSource) return
    const features = elevations.length
      ? map.querySourceFeatures(this.parcelFillLayer.source, {
          sourceLayer: this.parcelFillLayer.sourceLayer,
          filter: [
            'match',
            ['id'],
            elevations.map(e => Number(e.id)),
            true,
            false
          ]
        })
      : []

    const dimensions: GeoJSON.Feature<GeoJSON.Point, { length: any }>[] = []
    features.forEach(parcel => {
      try {
        // @ts-ignore
        const polygon = turf.polygon(parcel.geometry.coordinates, {
          parcelId: parcel.id
        })
        const segments = turf.lineSegment(polygon)

        segments.features.forEach(feature => {
          const from = turf.point(
            feature.geometry?.coordinates[0] as turf.helpers.Position
          )
          const to = turf.point(
            feature.geometry?.coordinates[1] as turf.helpers.Position
          )
          const options = { units: 'feet' }

          // @ts-ignore
          const distance = turf.distance(from, to, options).toFixed(1)
          if (distance > 10) {
            const midpoint = turf.midpoint(from, to)

            const point = turf.point(
              midpoint.geometry?.coordinates as turf.helpers.Position,
              {
                length: distance
              }
            ) as GeoJSON.Feature<GeoJSON.Point, { length: any }>

            dimensions.push(point)
          }
        })
      } catch (e) {}
    })

    const { source: dimensionSource } = this.parcelDimensionSource
    dimensionSource.data.features = dimensions

    const mapDimensionSource = map.getSource(
      this.parcelDimensionSource.id
    ) as mapboxgl.GeoJSONSource
    if (mapDimensionSource) {
      mapDimensionSource.setData(dimensionSource.data)
    }

    return features
  }

  updateZoneSource = (zones: TopHap.Zone[]) => {
    const { source } = this.zoneSource
    const colors = {
      state: 'red',
      country: 'blue',
      zip: 'green',
      school: '#7eb546',
      place: 'black'
    }

    source.data.features = zones.map((zone, index) => {
      return {
        type: 'Feature',
        geometry: zone.geometry,
        properties: {
          index,
          color: colors[zone.type]
        }
      }
    })

    const mapSource = this.map?.getSource(
      this.zoneSource.id
    ) as mapboxgl.GeoJSONSource
    if (mapSource) {
      mapSource.setData(source.data)
    }
  }

  setMarker = (
    marker: string,
    pos?: mapboxgl.LngLatLike,
    icon?: React.ReactElement
  ) => {
    if (!this.map) return

    if (!this.markers[marker]) {
      const container = document.createElement('div')
      ReactDOM.render(icon as React.ReactElement, container)

      this.markers[marker] = new MapboxGL.Marker({
        element: container,
        anchor: 'top'
      })
    }

    if (pos) {
      this.markers[marker].setLngLat(pos).addTo(this.map)
    } else {
      this.markers[marker].remove()
    }
  }

  setParcelMarker = (
    mode: 'selected' | 'hoverOnList' | 'searched',
    id?: string | number
  ) => {
    if (this.parcelMarkers[mode]) {
      this.map?.setFeatureState(this.parcelMarkers[mode], { [mode]: false })
    }

    if (id) {
      this.parcelMarkers[mode] = {
        id: id,
        source: this.parcelFillLayer.source,
        sourceLayer: this.parcelFillLayer.sourceLayer
      }
      this.map?.setFeatureState(this.parcelMarkers[mode], { [mode]: true })
    }
  }

  setPropertyMarker = (property?: TopHap.Property) => {
    const zoom = this.map?.getZoom() as number
    if (zoom < MAP_SWITCHING_ZOOM_LEVEL) {
      const icon = (
        <img
          src={imgAppIcon}
          style={{ width: 40, objectFit: 'contain' }}
          alt=''
        />
      )

      this.setParcelMarker('hoverOnList')
      this.setMarker('property', property ? property.location : undefined, icon)
    } else {
      this.setMarker('property')
      this.setParcelMarker('hoverOnList', property ? property.id : undefined)
    }
  }

  setAddressMarker = (place?: TopHap.Place) => {
    this.setParcelMarker('searched', place ? place.id : undefined)
  }

  setSelectedParcel = (id?: string | number) => {
    this.setParcelMarker('selected', id)
  }
}
