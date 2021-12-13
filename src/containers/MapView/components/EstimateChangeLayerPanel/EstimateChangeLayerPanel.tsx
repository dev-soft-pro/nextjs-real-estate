import React from 'react'
import AnalyticsLayerOptions from '../AnalyticsLayerOptions'
import Select, { Option } from 'components/Select'

interface EstimateChangeLayerPanelProps {
  estimateOptions: TopHap.MapPreferences['estimateOptions']
  setMapOption: TopHap.PreferencesCreators['setMapOption']
}

export default function EstimateChangeLayerPanel({
  estimateOptions,
  setMapOption
}: EstimateChangeLayerPanelProps) {
  function onSelect(event: any) {
    setMapOption('estimateOptions.period', event.target.value)
  }

  return (
    <AnalyticsLayerOptions>
      <div className='th-label mb-1'>Period</div>
      <Select value={estimateOptions.period} onChange={onSelect}>
        <Option value='past20Y'>20 years ago</Option>
        <Option value='past10Y'>10 years ago</Option>
        <Option value='past5Y'>5 years ago</Option>
        <Option value='past4Y'>4 years ago</Option>
        <Option value='past3Y'>3 years ago</Option>
        <Option value='past2Y'>2 years ago</Option>
        <Option value='past1Y'>1 year ago</Option>
        <Option value='past6M'>6 months ago</Option>
        <Option value='past1M'>1 month ago</Option>
        <Option value='next1Y'>1 year forecast</Option>
        <Option value='next2Y'>2 year forecast</Option>
      </Select>
    </AnalyticsLayerOptions>
  )
}
