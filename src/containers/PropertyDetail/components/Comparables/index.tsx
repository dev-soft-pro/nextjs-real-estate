import React from 'react'
import commaNumber from 'comma-number'
import OverlaySpinner from 'components/OverlaySpinner'
import MapboxUtils from 'utils/mapbox'

import styles from './styles.scss?type=global'

function Self({
  className,
  property
}: {
  className?: string
  property: TopHap.Property
}) {
  return (
    <tr className={className}>
      <td></td>
      <td>{property.displayAddress}</td>
      <td>{property.TransactionDate}</td>
      <td>{commaNumber(Math.round(property.TransactionAmount))}</td>
      <td>{commaNumber(Math.round(property.TransactionAmountPerSqft))}</td>
      <td>{property.address.City}</td>
      <td>{property.address.PostalCode}</td>
      <td>{property.BedsCount}</td>
      <td>{property.BathsDecimal}</td>
      <td>{property.LivingSqft}</td>
      <td>{property.LotAcres}</td>
      <td>{property.YearBuilt}</td>
      <td>{property.id}</td>
    </tr>
  )
}

function Comparable({
  className,
  index,
  reference
}: {
  className?: string
  index: number
  reference: any
}) {
  return (
    <tr className={className}>
      <td>{index}</td>
      <td>{reference.other.Address}</td>
      <td>{reference.other.CloseDate}</td>
      <td>
        {commaNumber(
          Math.round(
            reference.other.ClosePricePerSqft * reference.other.LivingArea
          )
        )}
      </td>
      <td>{Number(reference.other.ClosePricePerSqft).toFixed(1)}</td>
      <td>{reference.other.City}</td>
      <td>{reference.other.Zip}</td>
      <td>{reference.other.BedroomsTotal}</td>
      <td>{reference.other.BathroomsFull}</td>
      <td>{reference.other.LivingArea}</td>
      <td>{reference.other.LotSizeAcres}</td>
      <td>{reference.other.YearBuilt}</td>
      <td>{reference.other.ATTOMID}</td>
    </tr>
  )
}

interface ComparablesProps {
  loading?: boolean
  mapStyle: string
  property: TopHap.Property
  others: any[]
}

export default function Comparables({
  loading,
  mapStyle,
  others,
  property
}: ComparablesProps) {
  const refMapContainer = React.useRef<HTMLDivElement>(null)
  const map = React.useRef<mapboxgl.Map | null>(null)

  React.useEffect(() => {
    createMap()

    return deleteMap
  }, [])

  React.useEffect(() => {
    updateMap()
  }, [property, others])

  async function createMap() {
    if (!refMapContainer.current) return

    map.current = await MapboxUtils.createMap(
      'Comparables',
      {
        center: property.location,
        zoom: 14,
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
    MapboxUtils.destoryMap('Comparables', map.current)
  }

  function updateMap() {
    if (!map.current) return
    if (!map.current.isStyleLoaded()) return

    const center = property.location

    const selfData = {
      type: 'Feature',
      geometry: {
        type: 'Point',
        coordinates: center
      },
      properties: {
        color: '#37474F',
        label: 0
      }
    }

    const data = others
      ? others.map((e, index) => ({
          type: 'Feature',
          geometry: {
            type: 'Point',
            coordinates: [e.other.lon, e.other.lat]
          },
          properties: {
            color: '#6b87e9',
            label: index + 1
          }
        }))
      : []

    const sourceId = 'comparables-source'
    const mapSource = map.current.getSource(sourceId) as mapboxgl.GeoJSONSource

    if (mapSource) {
      mapSource.setData({
        type: 'FeatureCollection',
        features: [selfData, ...data]
      } as GeoJSON.FeatureCollection<GeoJSON.Geometry, GeoJSON.GeoJsonProperties>)
    } else {
      map.current.addSource(sourceId, {
        type: 'geojson',
        data: {
          type: 'FeatureCollection',
          features: [selfData, ...data]
        } as GeoJSON.FeatureCollection<
          GeoJSON.Geometry,
          GeoJSON.GeoJsonProperties
        >
      })

      map.current.addLayer({
        id: 'circle-layer',
        type: 'circle',
        source: sourceId,
        paint: {
          'circle-radius': 12,
          'circle-color': ['get', 'color']
        }
      })

      map.current.addLayer({
        id: 'symbol-layer',
        type: 'symbol',
        source: sourceId,
        layout: {
          'text-field': '{label}'
        },
        paint: {
          'text-color': 'white'
        }
      })
    }
  }

  return (
    <div className='th-comparables'>
      <div className='th-map-container' ref={refMapContainer}></div>
      <div className='th-table'>
        <table>
          <thead>
            <tr>
              <th />
              <th>Address</th>
              <th>Sold Date</th>
              <th>Sold $</th>
              <th>Sold $/sqft</th>
              <th>City</th>
              <th>Zip</th>
              <th>Beds</th>
              <th>Baths</th>
              <th>Living Area</th>
              <th>Lot Size</th>
              <th>Year Built</th>
              <th>ID</th>
            </tr>
          </thead>
          <tbody>
            <Self className='th-property-self' property={property} />
            {others &&
              others.map((e, index) => (
                <Comparable
                  reference={e}
                  key={e.other.ATTOMID}
                  index={index + 1}
                />
              ))}
          </tbody>
        </table>
      </div>
      <OverlaySpinner visible={loading} absolute />

      <style jsx>{styles}</style>
    </div>
  )
}
