import React from 'react'
import AnalyticsLayerOptions from '../AnalyticsLayerOptions'
import Select, { Option } from 'components/Select'

interface EstimateChangeLayerPanelProps {
  taxOptions: TopHap.MapPreferences['taxOptions']
  setMapOption: TopHap.PreferencesCreators['setMapOption']
}

export default function EstimateChangeLayerPanel({
  taxOptions,
  setMapOption
}: EstimateChangeLayerPanelProps) {
  function onSelect(event: any) {
    setMapOption('taxOptions.type', event.target.value)
  }

  return (
    <AnalyticsLayerOptions>
      <div className='th-label mb-1'>Type</div>
      <Select value={taxOptions.type} onChange={onSelect}>
        <Option value='improvements'>Tax Assessed Value Improvements</Option>
        <Option value='land'>Tax Assessed Value Land</Option>
        <Option value='total'>Tax Assessed Value Total</Option>
        <Option value='billed'>Tax Billed Amount</Option>
        <Option value='billed_acre'>Tax Billed Amount / Acre</Option>
        <Option value='billed_sqft'>Tax Billed Amount / Sqft</Option>
      </Select>
    </AnalyticsLayerOptions>
  )
}
