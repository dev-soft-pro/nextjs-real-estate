import React from 'react'
import Button from 'components/Button'
import { logEvent } from 'services/analytics'

import styles from './styles.scss?type=global'

interface RemoveBoundryProps {
  drawings: TopHap.PreferencesState['drawings']
  elevations: TopHap.MapPreferences['elevations']
  place: TopHap.PreferencesState['place']
  updatePreferences: TopHap.PreferencesCreators['updateStates']
}

export default function RemoveBoundry({
  drawings,
  elevations,
  place,
  updatePreferences
}: RemoveBoundryProps) {
  function onClick() {
    updatePreferences({ keyword: '', place: undefined, drawings: [] })

    logEvent('map', 'remove_boundary')
  }

  if ((place || drawings.length) && !elevations) {
    return (
      <div className='th-remove-boundary'>
        <Button className='th-remove-boundary-button' onClick={onClick}>
          Remove Map Boundary
        </Button>

        <style jsx>{styles}</style>
      </div>
    )
  } else {
    return null
  }
}
