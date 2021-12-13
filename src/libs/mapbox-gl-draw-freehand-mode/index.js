import doubleClickZoom from '@mapbox/mapbox-gl-draw/src/lib/double_click_zoom'
import * as Constants from '@mapbox/mapbox-gl-draw/src/constants'
import DrawPolygon from '@mapbox/mapbox-gl-draw/src/modes/draw_polygon'
import dragPan from './lib/drag_pan'
import simplify from '@turf/simplify'

const FreeDraw = DrawPolygon

FreeDraw.onSetup = function () {
  const polygon = this.newFeature({
    type: Constants.geojsonTypes.FEATURE,
    properties: {},
    geometry: {
      type: Constants.geojsonTypes.POLYGON,
      coordinates: [[]]
    }
  })

  this.addFeature(polygon)

  this.clearSelectedFeatures()
  doubleClickZoom.disable(this)
  dragPan.disable(this)
  this.updateUIClasses({ mouse: Constants.cursors.ADD })
  this.activateUIButton(Constants.types.POLYGON)
  this.setActionableState({
    trash: true
  })

  return {
    polygon,
    currentVertexPosition: 0,
    dragMoving: false
  }
}

FreeDraw.onDrag = function (state, e) {
  state.dragMoving = true
  this.updateUIClasses({ mouse: Constants.cursors.ADD })
  state.polygon.updateCoordinate(
    `0.${state.currentVertexPosition}`,
    e.lngLat.lng,
    e.lngLat.lat
  )
  state.currentVertexPosition++
  state.polygon.updateCoordinate(
    `0.${state.currentVertexPosition}`,
    e.lngLat.lng,
    e.lngLat.lat
  )
}

FreeDraw.onMouseUp = FreeDraw.onTouchEnd = function (state, e) {
  if (state.dragMoving) {
    // Edited by SnowSea
    // var tolerance = 3 / ((this.map.getZoom() - 4) * 400) // https://www.desmos.com/calculator/b3zi8jqskw
    const tolerance = 0.0005 / (this.map.getZoom() - 5 + 1)
    simplify(state.polygon, {
      mutate: true,
      tolerance: tolerance,
      highQuality: true
    })

    this.fireUpdate()
    this.changeMode(Constants.modes.SIMPLE_SELECT, {
      featureIds: [state.polygon.id]
    })
  }
}

FreeDraw.fireUpdate = function () {
  this.map.fire(Constants.events.UPDATE, {
    action: Constants.updateActions.MOVE,
    features: this.getSelected().map(f => f.toGeoJSON())
  })
}

// Added by SnowSea
FreeDraw.onStop = function (state) {
  this.updateUIClasses({ mouse: Constants.cursors.NONE })
  doubleClickZoom.enable(this)
  this.activateUIButton()

  // check to see if we've deleted this feature
  if (this.getFeature(state.polygon.id) === undefined) return

  // remove last added coordinate
  state.polygon.removeCoordinate(`0.${state.polygon.coordinates[0].length - 1}`)
  if (state.polygon.isValid()) {
    this.map.fire(Constants.events.CREATE, {
      features: [state.polygon.toGeoJSON()]
    })

    setTimeout(() => {
      dragPan.enable(this)
      this.changeMode(Constants.modes.SIMPLE_SELECT, {}, { silent: true })
    })
  } else {
    this.deleteFeature([state.polygon.id], { silent: true })
    this.changeMode(Constants.modes.SIMPLE_SELECT, {}, { silent: true })
  }
}

export default FreeDraw
