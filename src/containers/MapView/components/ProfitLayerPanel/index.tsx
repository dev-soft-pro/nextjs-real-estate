import React from 'react'

import RangeSlider from 'components/RangeSlider'
import TextInput from 'components/TextInput'
import AnalyticsLayerOptions from '../AnalyticsLayerOptions'
import Select, { Option } from 'components/Select'

interface ProfitLayerPanel {
  enabled: boolean
  profitOptions: TopHap.MapPreferences['profitOptions']
  setMapOption: TopHap.PreferencesCreators['setMapOption']
}

type Range = {
  min: number
  max: number
}

export default function ProfitLayerPanel({
  enabled,
  profitOptions,
  setMapOption
}: ProfitLayerPanel) {
  const [soldWithinMonths, setSoldWithinMonths] = React.useState({
    min: profitOptions.soldWithinDays.min / 30,
    max: profitOptions.soldWithinDays.max / 30
  })

  const [ownershipMonths, setOwnershipMonths] = React.useState({
    min: profitOptions.ownershipDays.min / 30,
    max: profitOptions.ownershipDays.max / 30
  })

  const [profit, setProfit] = React.useState(profitOptions.profit)

  function onSelect(event: any, option: string) {
    setMapOption(option, event?.target.value)
  }

  return (
    <AnalyticsLayerOptions>
      <Select
        className='mt-1'
        value={profitOptions.mode}
        onChange={e => onSelect(e, 'profitOptions.mode')}
        disabled={!enabled}
      >
        <Option value='margin'>Margin</Option>
        <Option value='sum'>Total</Option>
      </Select>

      <div className='mt-2'>
        <div className='th-label'>Min Count</div>
        <TextInput
          className='th-input'
          value={profitOptions.docCount}
          onChange={e => onSelect(e, 'profitOptions.docCount')}
        />
      </div>

      <div className='mt-1'>
        <div className='th-label'>soldWithinMonths</div>
        <RangeSlider
          maxValue={60}
          minValue={0}
          draggableTrack
          value={soldWithinMonths}
          onChange={(value: Range) => setSoldWithinMonths(value)}
          onChangeComplete={({ min, max }: Range) =>
            setMapOption('profitOptions.soldWithinDays', {
              min: min * 30,
              max: max * 30
            })
          }
        />
      </div>
      <div>
        <div className='th-label'>ownershipMonths</div>
        <RangeSlider
          maxValue={60}
          minValue={0}
          draggableTrack
          value={ownershipMonths}
          onChange={(value: Range) => setOwnershipMonths(value)}
          onChangeComplete={({ min, max }: Range) =>
            setMapOption('profitOptions.ownershipDays', {
              min: min * 30,
              max: max * 30
            })
          }
        />
      </div>
      <div>
        <div className='th-label'>profit</div>
        <RangeSlider
          maxValue={10}
          minValue={0}
          draggableTrack
          value={profit}
          onChange={(value: Range) => setProfit(value)}
          onChangeComplete={(value: Range) =>
            setMapOption('profitOptions.profit', value)
          }
        />
      </div>
    </AnalyticsLayerOptions>
  )
}
