import { accessToken } from 'configs/mapbox'

export default class MapboxUtils {
  private static _library?: typeof import('mapbox-gl')
  public static backup: {
    [eleName: string]: mapboxgl.Map
  } = {}

  static async library() {
    if (MapboxUtils._library) {
      return MapboxUtils._library
    } else {
      const lib = await import('mapbox-gl')
      import('mapbox-gl/dist/mapbox-gl.css')
      MapboxUtils._library = lib
      return lib
    }
  }

  static async createMap(
    storeId: string,
    viewport: {
      center?: mapboxgl.LngLatLike
      pitch: number
      zoom?: number
      bearing: number
      maxZoom?: number
      bounds?: mapboxgl.LngLatBoundsLike
    },
    mapStyle: string,
    container: string | HTMLElement,
    moreOptions: any = {}
  ) {
    const lib = await MapboxUtils.library()
    if (!lib.supported()) return null

    const { center, pitch, zoom, bearing, bounds } = viewport

    let map
    if (MapboxUtils.backup[storeId]) {
      map = MapboxUtils.backup[storeId]

      // When reusing the saved map, we need to reparent the map(canvas) and other child nodes
      // into the new container from the props.
      // Step1: reparenting child nodes from old container to new container
      const oldContainer = map.getContainer()
      const newContainer: HTMLElement =
        typeof container === 'string'
          ? (document.getElementById(container) as HTMLElement)
          : container
      newContainer.classList.add('mapboxgl-map')
      while (oldContainer.childNodes.length > 0) {
        newContainer.appendChild(oldContainer.childNodes[0])
      }

      // Step2: replace the internal container with new container from the react component
      // @ts-ignore
      map._container = newContainer
      delete MapboxUtils.backup[storeId]

      // Step3: update style
      // if (mapStyle) {
      //   map.setStyle(mapStyle, {
      //     // From the user's perspective, there's no "diffing" on initialization
      //     // We always rebuild the style from scratch when creating a new Mapbox instance
      //     diff: false
      //   })
      // }

      // set new states
      if (bounds) {
        map.fitBounds(bounds, { duration: 0 })
      } else {
        map.jumpTo({ center, pitch, zoom, bearing })
      }
    } else {
      // create new map
      map = new lib.Map({
        container,
        style: mapStyle,
        center,
        pitch,
        zoom,
        bearing,
        bounds,
        accessToken,
        ...moreOptions
      })
    }

    return map
  }

  static destoryMap(storeId: string, map?: mapboxgl.Map | null) {
    if (!map) return

    if (!MapboxUtils.backup[storeId]) {
      MapboxUtils.backup[storeId] = map
    } else {
      map.remove()
    }
  }
}
