import React from 'react'
import ReactDOM from 'react-dom'
import dynamic from 'next/dynamic'
import { StreetViewProps } from 'react-google-map-street-view'
import MapboxUtils from 'utils/mapbox'

import Carousel from 'components/SwipableCarousel'

import ImageViewer from '../ImageViewer'

import imgMarker from 'assets/images/map/marker.png'
import { googleMapKey } from 'configs'
import { BREAK_SM } from 'consts'
import styles from './styles.scss?type=global'

const StreetView = dynamic<StreetViewProps>(
  () => import('react-google-map-street-view').then(mod => mod.StreetView),
  { ssr: false }
)

interface ViewsProps {
  isMobile: boolean
  mapStyle: string
  media?: TopHap.PropertyMedia
  property: TopHap.Property
  shape: GeoJSON.Feature<any>
  tourUrl?: string
  viewType: 'Map' | 'Street' | 'Photo' | 'VTour'
  width: number
  togglePhotoView(): void
}

export default function ViewsProps({
  isMobile,
  mapStyle,
  media,
  property,
  shape,
  tourUrl,
  viewType,
  width,
  togglePhotoView
}: ViewsProps) {
  const refMapContainer = React.useRef<HTMLDivElement>(null)
  const map = React.useRef<mapboxgl.Map | null>(null)
  const [photoIndex, setPhotoIndex] = React.useState(0)

  React.useEffect(() => {
    if (viewType === 'Map' && !map.current) {
      createMap()
      return deleteMap
    }
  }, [viewType])

  const images = media ? media.photos : []

  async function createMap() {
    if (!refMapContainer.current) return

    map.current = await MapboxUtils.createMap(
      'PropertyPosition',
      {
        center: property.location,
        zoom: 16,
        maxZoom: 20,
        pitch: 0,
        bearing: 0
      },
      mapStyle,
      refMapContainer.current
    )

    if (!map.current) return
    map.current.on('load', updateMap)
  }

  function deleteMap() {
    if (!map.current) return

    map.current.off('load', updateMap)
    MapboxUtils.destoryMap('PropertyPosition', map.current)
  }

  async function updateMap() {
    if (!map.current) return

    // position marker
    const MARKER_SIZE = 36
    const markerElement = document.createElement('div')
    ReactDOM.render(
      <img
        src={imgMarker}
        style={{
          width: MARKER_SIZE,
          height: MARKER_SIZE,
          objectFit: 'cover'
        }}
        alt='Position'
      />,
      markerElement
    )

    const MapboxGL = await MapboxUtils.library()
    new MapboxGL.Marker({
      element: markerElement,
      anchor: 'bottom'
    })
      .setLngLat(property.location)
      .addTo(map.current)

    // boundary layer
    const sourceId = 'isochrones-source'
    map.current.addSource(sourceId, {
      type: 'geojson',
      data: shape
    })
    map.current.addLayer({
      id: 'isochrones-layer',
      type: 'line',
      source: sourceId,
      layout: {
        'line-join': 'round',
        'line-cap': 'round'
      },
      paint: {
        'line-color': {
          type: 'identity',
          property: 'color'
        },

        'line-width': 2
      }
    })
  }

  return (
    <div className='th-viewer-container'>
      <div
        key='th-map-container'
        className='th-map-container'
        ref={refMapContainer}
        style={{ display: viewType === 'Map' ? 'block' : 'none' }}
      />
      {viewType === 'Street' && (
        <StreetView
          address={property.address.FullAddress}
          APIkey={googleMapKey}
          streetView
          zoomLevel={15}
          mapStyle={{
            width: '100%',
            height: '100%'
          }}
        />
      )}
      {viewType === 'Photo' &&
        (width <= BREAK_SM ? (
          <Carousel
            images={images}
            count={images.length}
            isMobile={isMobile}
            onClick={togglePhotoView}
          />
        ) : (
          <ImageViewer
            images={images}
            currentIndex={photoIndex}
            onChangeIndex={setPhotoIndex}
            onViewGallery={togglePhotoView}
          />
        ))}
      {viewType === 'VTour' && (
        <iframe title='3D Tour' src={tourUrl} allowFullScreen frameBorder='0' />
      )}

      <style jsx>{styles}</style>
    </div>
  )
}
