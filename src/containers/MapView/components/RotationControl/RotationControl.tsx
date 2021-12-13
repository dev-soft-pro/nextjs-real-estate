import React, { useEffect, useState } from 'react'
import Slider from '@material-ui/core/Slider'

import styles from './styles.scss?type=global'
import { CameraOptions } from 'mapbox-gl'

interface RotationControl {
  elevations: boolean
  viewport: TopHap.MapPreferences['viewport']
  setMapOption: TopHap.PreferencesCreators['setMapOption']
  updateMapForPreview(viewport: CameraOptions): void
}

export default function RotationControl({
  elevations,
  viewport,
  setMapOption,
  updateMapForPreview
}: RotationControl) {
  const [bearing, setBearing] = useState(viewport.bearing)
  const [pitch, setPitch] = useState(viewport.pitch)

  useEffect(() => {
    setBearing(viewport.bearing)
  }, [viewport.bearing])

  useEffect(() => {
    setPitch(viewport.pitch)
  }, [viewport.pitch])

  if (!elevations) return null

  function previewBearing(
    event: React.ChangeEvent<{}>,
    value: number | number[]
  ) {
    const bearing = value as number
    setBearing(bearing)
    updateMapForPreview({ bearing })
  }

  function previewPitch(
    event: React.ChangeEvent<{}>,
    value: number | number[]
  ) {
    const pitch = value as number
    setPitch(pitch)
    updateMapForPreview({ pitch })
  }

  function updateBearing(
    event: React.ChangeEvent<{}>,
    value: number | number[]
  ) {
    const bearing = value as number
    setMapOption('viewport', { bearing, updatedBy: 'USER' }, true)
  }

  function updatePitch(event: React.ChangeEvent<{}>, value: number | number[]) {
    const pitch = value as number
    setMapOption('viewport', { pitch, updatedBy: 'USER' }, true)
  }

  return (
    <>
      <div className='th-pitch-slider'>
        <Slider
          classes={{
            root: 'th-slider',
            rail: 'th-slider-rail',
            track: 'th-slider-track',
            thumb: 'th-slider-thumb'
          }}
          orientation='vertical'
          min={0}
          max={60}
          value={pitch}
          onChange={previewPitch}
          onChangeCommitted={updatePitch}
        />
      </div>
      <div className='th-bearing-slider-container'>
        {/* <Button
          className='th-bearing-play-button'
          onClick={this.toggleAutoBearing}
        >
          {autoBearing ? '❚❚' : '▶'}
        </Button> */}
        <div className='th-bearing-slider'>
          <Slider
            classes={{
              root: 'th-slider',
              rail: 'th-slider-rail',
              track: 'th-slider-track',
              thumb: 'th-slider-thumb'
            }}
            min={-179.99}
            max={180}
            value={bearing}
            onChange={previewBearing}
            onChangeCommitted={updateBearing}
          />
        </div>
      </div>
      <style jsx>{styles}</style>
    </>
  )
}
