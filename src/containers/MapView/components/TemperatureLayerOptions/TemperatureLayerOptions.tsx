import React from 'react'
import AnalyticsLayerOptions from '../AnalyticsLayerOptions'
import Select, { Option } from 'components/Select'
import Switch from 'components/Switch'

interface Props {
  temperatureOptions: TopHap.MapPreferences['temperatureOptions']
  setMapOption: TopHap.PreferencesCreators['setMapOption']
}

export default function TemperatureLayerOptions({
  temperatureOptions,
  setMapOption
}: Props) {
  function onSelect(
    event: React.ChangeEvent<{
      name?: string | undefined
      value: unknown
    }>
  ) {
    setMapOption('temperatureOptions.type', event.target.value)
  }

  function onWinter(e: React.ChangeEvent<HTMLInputElement>, checked: boolean) {
    setMapOption('temperatureOptions.winter', checked)
  }

  return (
    <AnalyticsLayerOptions>
      <div className='d-flex flex-direction-row align-items-center'>
        <div className='th-label ml-2'>Summer</div>
        <Switch checked={temperatureOptions.winter} onChange={onWinter} />
        <div className='th-label ml-1'>Winter</div>
      </div>
      <div>
        <div className='th-label ml-2 mb-1'>Type</div>
        <Select value={temperatureOptions.type} onChange={onSelect}>
          <Option value='average'>Average</Option>
          <Option value='low'>Low</Option>
          <Option value='high'>High</Option>
        </Select>
      </div>
    </AnalyticsLayerOptions>
  )
}
