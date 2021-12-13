import React from 'react'

// import Checkbox from 'components/Checkbox'
import Radio from 'components/Radio'
// import Select, { Option } from 'components/Select'

import styles from './styles.scss?type=global'

interface PermitsLayerPanelProps {
  types: any[]
  descriptive: TopHap.MapPreferences['descriptive']
  permitOptions: TopHap.MapPreferences['permitOptions']
  setMapOption: TopHap.PreferencesCreators['setMapOption']
}

export default function PermitsLayerPanel({
  descriptive,
  permitOptions,
  // types,
  setMapOption
}: PermitsLayerPanelProps) {
  function onChangeType(e: any) {
    setMapOption('descriptive', { enabled: true, metric: e.target.value }, true)
  }

  // const permitTypes = types.map(e => (
  //   <Option key={e} value={e}>
  //     {e}
  //   </Option>
  // ))

  return (
    <div className='th-permits-layer-panel'>
      <div className='th-option-container'>
        <div className='th-permits-types'>
          <Radio
            className='th-permits-type'
            label='Count'
            value='permits_count'
            checked={
              descriptive.enabled && descriptive.metric === 'permits_count'
            }
            onChange={onChangeType}
          />
          <Radio
            className='th-permits-type'
            label='Value'
            value='permits_value'
            checked={
              descriptive.enabled && descriptive.metric === 'permits_value'
            }
            onChange={onChangeType}
          />
        </div>
        <div className='th-permits-years'>
          <input
            className='th-permits-years-input'
            value={permitOptions.years}
            onChange={e =>
              setMapOption('permitOptions.years', Number(e.target.value))
            }
            min={1}
          />
          <div className='th-permits-years-title'>Date Range</div>
          <div className='th-permits-years-suffix'>Years</div>
        </div>
      </div>

      {/* <section className='th-option-container'>
        <Checkbox
          label='Closed Only'
          checked={permitOptions.closedOnly}
          onChange={(_, checked) =>
            setMapOption('permitOptions.closedOnly', checked)
          }
        />
      </section>

      <section className='th-option-container'>
        <Checkbox
          label='With Types'
          checked={permitOptions.withTypes}
          onChange={(_, checked) =>
            setMapOption('permitOptions.withTypes', checked)
          }
        />
        <Select
          value={permitOptions.types}
          onChange={e => setMapOption('permitOptions.types', e.target.value)}
          multiple
          disabled={!permitOptions.withTypes}
        >
          {permitTypes}
        </Select>
      </section> */}

      <style jsx>{styles}</style>
    </div>
  )
}
