import React from 'react'
import AnalyticsLayerPanel from '../components/AnalyticsLayerPanel'
import BoundariesPanel from '../components/BoundariesPanel'
import ElevationControls from '../components/ElevationControls'
import Legend from '../components/Legend'
import MapStylePanel from '../components/MapStylePanel'
import RemoveBoundary from '../components/RemoveBoundary'
import Timeline from '../components/Timeline'

function Overlays({ mobile }: { mobile?: boolean }) {
  return (
    <div className='th-map-overlays'>
      <Legend />
      <RemoveBoundary />
      <ElevationControls />
      <BoundariesPanel />
      <MapStylePanel />
      {!mobile && <AnalyticsLayerPanel />}
      <Timeline />
    </div>
  )
}

export default React.memo(Overlays)
