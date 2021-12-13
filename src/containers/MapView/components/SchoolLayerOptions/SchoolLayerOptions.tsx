import React from 'react'
import AnalyticsLayerOptions from '../AnalyticsLayerOptions'
import Select, { Option } from 'components/Select'

interface SchoolLayerOptionsProps {
  schoolOptions: TopHap.MapPreferences['schoolOptions']
  setMapOption: TopHap.PreferencesCreators['setMapOption']
}

export default function SchoolLayerOptions({
  schoolOptions,
  setMapOption
}: SchoolLayerOptionsProps) {
  function onSelect(event: any) {
    setMapOption('schoolOptions.type', event.target.value)
  }

  return (
    <AnalyticsLayerOptions>
      <div className='th-label mb-1'>Type</div>
      <Select value={schoolOptions.type} onChange={onSelect}>
        <Option value='elementary'>Elementary School</Option>
        <Option value='middle'>Middle School</Option>
        <Option value='high'>High School</Option>
      </Select>
    </AnalyticsLayerOptions>
  )
}
