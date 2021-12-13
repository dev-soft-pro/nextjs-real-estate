import React from 'react'
import AnalyticsLayerOptions from '../AnalyticsLayerOptions'
import Checkbox from 'components/Checkbox'

interface UniqueZonesLayerPanelProps {
  uniqueZonesOptions: TopHap.MapPreferences['uniqueZonesOptions']
  setMapOption: TopHap.PreferencesCreators['setMapOption']
}

export default function UniqueZonesLayerPanel({
  uniqueZonesOptions,
  setMapOption
}: UniqueZonesLayerPanelProps) {
  function onChange(e: React.ChangeEvent<HTMLInputElement>, checked: boolean) {
    setMapOption('uniqueZonesOptions.school', checked)
  }

  return (
    <AnalyticsLayerOptions>
      <Checkbox
        label='School'
        checked={uniqueZonesOptions.school}
        onChange={onChange}
      />
    </AnalyticsLayerOptions>
  )
}
