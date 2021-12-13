import cn from 'classnames'
import Button from 'components/Button'

import SvgStreetView from 'assets/images/icons/street-view.svg'
import SvgMapMarker from 'assets/images/icons/map-marker.svg'
import SvgImage from 'assets/images/icons/image.svg'
import SvgYoutube from 'assets/images/social/youtube.svg'

import styles from './styles.scss?type=global'

export type ViewType = 'Map' | 'Street' | 'Photo' | 'VTour'

interface ViewTypesProps {
  map: boolean
  tour: boolean
  viewType: ViewType
  onChange(newType: ViewType): void
}

export default function ViewTypes({
  map,
  tour,
  viewType,
  onChange
}: ViewTypesProps) {
  return (
    <div className='th-view-types'>
      <Button
        className={cn('th-view-type', {
          'th-selected': viewType === 'Photo'
        })}
        onClick={() => onChange('Photo')}
      >
        <SvgImage /> <span>Photos</span>
      </Button>
      {tour && (
        <Button
          className={cn('th-view-type', {
            'th-selected': viewType === 'VTour'
          })}
          onClick={() => onChange('VTour')}
        >
          <SvgYoutube /> <span>Tour</span>
        </Button>
      )}
      <Button
        className={cn('th-view-type', {
          'th-selected': viewType === 'Street'
        })}
        onClick={() => onChange('Street')}
      >
        <SvgStreetView /> <span>Street View</span>
      </Button>
      {map && (
        <Button
          className={cn('th-view-type', {
            'th-selected': viewType === 'Map'
          })}
          onClick={() => onChange('Map')}
        >
          <SvgMapMarker /> <span>Map</span>
        </Button>
      )}

      <style jsx>{styles}</style>
    </div>
  )
}
