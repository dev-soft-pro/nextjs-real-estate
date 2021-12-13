import React from 'react'

import Checkbox from 'components/Checkbox'
import Select, { Option } from 'components/Select'
import Switch from 'components/Switch'

import imgPinDefault from 'assets/images/pin/active.png'
import { propertyData } from 'consts/data_mapping'
import { logEvent } from 'services/analytics'
import styles from './styles.scss?type=global'

const selectOptions = Object.keys(propertyData).map(e => ({
  key: e,
  title: propertyData[e as TopHap.PropertyMetric].title
}))

interface LegendOptionsPanelProps {
  descriptive: TopHap.MapPreferences['descriptive']
  properties: TopHap.MapPreferences['properties']
  timeline: TopHap.MapPreferences['timeline']
  setMapOption: TopHap.PreferencesCreators['setMapOption']
  setFilterOption: TopHap.PreferencesCreators['setFilterOption']
}

export default function LegendOptionsPanel({
  descriptive,
  properties,
  timeline,
  setMapOption,
  setFilterOption
}: LegendOptionsPanelProps) {
  function setOption(option: string, value: any, update?: boolean) {
    setMapOption(option, value, update)

    logEvent('map', 'legend', 'option_change', { option, value, update })
  }

  function onSelect(event: any, option: string) {
    setOption(option, event.target.value)
  }

  const selectItems = selectOptions.map(e => (
    <Option key={e.key} value={e.key}>
      {e.title}
    </Option>
  ))

  const listingColors = ['#0f0', '#0ff', '#00f', '#f0f', '#f00']

  return (
    <div className='th-legend-options-panel'>
      <section className='th-section'>
        <Checkbox
          label='Display Listings'
          checked={properties.enabled}
          onChange={(_, checked) => setOption('properties.enabled', checked)}
        />

        {properties.enabled && (
          <>
            <div className='th-option mb-2'>
              <div className='th-option-row'>
                <Checkbox
                  label='Color'
                  checked={properties.colorEnabled}
                  onChange={(_, checked) =>
                    setOption('properties.colorEnabled', checked)
                  }
                />
                <div className='th-colors'>
                  {listingColors.map(e => (
                    <div key={e} style={{ background: e }} />
                  ))}
                </div>
              </div>
              <Select
                value={properties.color}
                onChange={e => onSelect(e, 'properties.color')}
              >
                {selectItems}
              </Select>
            </div>

            <div className='th-option mb-1'>
              <div className='th-option-row'>
                <Checkbox
                  label='Radius'
                  checked={properties.radiusEnabled}
                  onChange={(_, checked) =>
                    setOption('properties.radiusEnabled', checked)
                  }
                />
                <div className='th-circles'>
                  {[8, 14, 18, 24].map(e => (
                    <div key={e} style={{ width: e, height: e }} />
                  ))}
                </div>
              </div>
              <Select
                value={properties.radius}
                onChange={e => onSelect(e, 'properties.radius')}
              >
                {selectItems}
              </Select>
            </div>

            <div className='th-option mb-1'>
              <div className='th-option-row'>
                <Checkbox
                  label='Show Labels'
                  checked={properties.labelEnabled}
                  onChange={(_, checked) =>
                    setOption('properties.labelEnabled', checked)
                  }
                />
                <img className='th-pin' src={imgPinDefault} alt='' />
              </div>
              <Select
                value={properties.label}
                onChange={e => onSelect(e, 'properties.label')}
              >
                {selectItems}
              </Select>
            </div>
          </>
        )}
      </section>

      <section className='th-section th-option'>
        <div className='th-option-row'>
          <div className='th-option-title'>Show Timeline</div>
          <Switch
            className='th-switch'
            checked={timeline}
            onChange={event => {
              setOption('timeline', event.target.checked)
              if (!event.target.checked) {
                setFilterOption('period', {})
              }
            }}
          />
        </div>
      </section>

      <style jsx>{styles}</style>
    </div>
  )
}
