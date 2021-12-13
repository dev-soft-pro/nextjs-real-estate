import React from 'react'
import AnalyticsLayerOptions from '../AnalyticsLayerOptions'
import Select, { Option } from 'components/Select'

interface EstimateChangeLayerPanelProps {
  estimateSoldRatioOptions: TopHap.MapPreferences['estimateSoldRatioOptions']
  setMapOption: TopHap.PreferencesCreators['setMapOption']
}

export default function EstimateChangeLayerPanel({
  estimateSoldRatioOptions,
  setMapOption
}: EstimateChangeLayerPanelProps) {
  function onSelect(event: any) {
    setMapOption('estimateSoldRatioOptions.type', event.target.value)
  }

  return (
    <AnalyticsLayerOptions>
      <div className='th-label mb-1'>Type</div>
      <Select value={estimateSoldRatioOptions.type} onChange={onSelect}>
        <Option value='percent'>Percent</Option>
        <Option value='value'>Value</Option>
      </Select>
    </AnalyticsLayerOptions>
  )
}
