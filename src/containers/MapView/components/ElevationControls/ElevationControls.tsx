import cn from 'classnames'

import AuthLock from 'components/AuthLock'
import Button from 'components/Button'
import Tooltip from 'components/Tooltip'
import { logEvent } from 'services/analytics'

import imgElevation from 'assets/images/map/elevation.jpg'
import styles from './styles.scss?type=global'

interface ElevationControlsProps {
  enabled: boolean
  place: TopHap.PreferencesState['place']
  setMapOption: TopHap.PreferencesCreators['setMapOption']
  resetElevations: TopHap.PropertiesCreators['resetElevations']
  toggleElevation: TopHap.PropertiesCreators['toggleElevation']
}

export default function ElevationControls({
  enabled,
  place,
  resetElevations,
  toggleElevation,
  setMapOption
}: ElevationControlsProps) {
  function onClick() {
    if (enabled) {
      setMapOption(
        'viewport',
        {
          pitch: 0,
          bearing: 0,
          updatedBy: 'USER'
        },
        true
      )
      resetElevations()
    } else {
      // if we searched a property
      if (place && place.place_type[0] === 'address') {
        toggleElevation(place.id)
        setMapOption(
          'viewport',
          {
            pitch: 60,
            center: place.center,
            updatedBy: 'USER'
          },
          true
        )
      } else {
        setMapOption(
          'viewport',
          {
            pitch: 60,
            updatedBy: 'USER'
          },
          true
        )
      }
    }

    setMapOption('elevations', !enabled)

    logEvent('map', 'elevation', null, { enabled: !enabled })
  }

  return (
    <>
      {enabled && (
        <Button className='th-exit-topography-button' onClick={onClick}>
          Exit Topography
        </Button>
      )}

      <div className='th-elevation-wrapper'>
        <Tooltip trigger='hover' tooltip='3D Topography Mode' placement='left'>
          <AuthLock event='elevation_layer' transparent />
          <div
            className={cn('th-elevation-button', {
              'th-active': enabled
            })}
            onClick={onClick}
          >
            <img className='th-icon' src={imgElevation} alt='Elevation' />
            <span className='th-title'>3D Elevation</span>
          </div>
        </Tooltip>
      </div>

      <style jsx>{styles}</style>
    </>
  )
}
