import React from 'react'

import NearbyChart from '../NearbyChart'

import Select, { Option } from 'components/Select'
import Tabs from 'components/Tabs'
import SvgBath from 'assets/images/metrics/bath.svg'
import SvgBeds from 'assets/images/metrics/bed.svg'
import SvgDate from 'assets/images/metrics/date.svg'
import SvgHome from 'assets/images/metrics/home.svg'
import SvgLot from 'assets/images/metrics/lot.svg'
import { logEvent } from 'services/analytics'
import { Types } from 'store/actions/properties'
import { Polygon } from '@turf/turf'

interface NearbyStatisticsProps {
  asyncStatus: TopHap.GlobalState['status']
  neighborhood: TopHap.PropertiesState['neighborhood']
  property: TopHap.Property
  shape: Polygon | null
  zones: TopHap.PropertySource['_source']['zones']
  getNeighborhood: TopHap.PropertiesCreators['getNeighborhood']
}

export default function NearbyStatistics({
  asyncStatus,
  neighborhood,
  property,
  shape,
  zones,
  getNeighborhood
}: NearbyStatisticsProps) {
  const [nearby, setNearby] = React.useState<
    'age' | 'bathrooms' | 'bedrooms' | 'living_area' | 'lot_size_acres'
  >('living_area')
  const [range, setRange] = React.useState<string>('local')

  const selfIndex = React.useMemo(() => {
    const self = {
      age: new Date().getFullYear() - property.YearBuilt,
      bathrooms: property.BathsDecimal,
      bedrooms: property.BedsCount,
      living_area: property.LivingSqft,
      lot_size_acres: property.LotAcres
    }

    for (let i = 0; i < neighborhood[nearby].length; ++i) {
      if (
        self[nearby] >= Number(neighborhood[nearby][i].from) &&
        self[nearby] <
          Number(neighborhood[nearby][i].to || Number.POSITIVE_INFINITY)
      ) {
        return i
      }
    }

    return neighborhood[nearby].length - 1
  }, [property, nearby, neighborhood])

  React.useEffect(() => {
    if (range === 'local') {
      getNeighborhood({ shape })
    } else {
      getNeighborhood({
        zones: [range]
      })
    }
  }, [range])

  function onChange(ev: any, value?: any) {
    setNearby(value)

    logEvent('property_detail', 'nearby_chart', 'tab_change', { value })
  }

  function onChangeRange(
    ev: React.ChangeEvent<{ name?: string | undefined; value: any }>
  ) {
    setRange(ev.target.value)
  }

  return (
    <>
      <Tabs value={nearby} onChange={onChange}>
        <Tabs.Tab icon={<SvgHome />} label='Living Area' value='living_area' />
        <Tabs.Tab icon={<SvgLot />} label='Lot Area' value='lot_size_acres' />
        <Tabs.Tab icon={<SvgBeds />} label='Bedrooms' value='bedrooms' />
        <Tabs.Tab icon={<SvgBath />} label='Bathrooms' value='bathrooms' />
        <Tabs.Tab icon={<SvgDate />} label='Property Age' value='age' />
      </Tabs>

      <Select
        value={range}
        onChange={onChangeRange}
        style={{ minWidth: 120 }}
        className='mt-2'
      >
        <Option value='local'>Local Area (1km)</Option>
        {zones.map(e => (
          <Option key={e.id} value={e.id}>
            {e.name} ({e.type})
          </Option>
        ))}
      </Select>

      <NearbyChart
        data={neighborhood[nearby]}
        selfIndex={selfIndex}
        loading={asyncStatus[Types.GET_NEIGHBORHOOD] === 'request'}
      />
    </>
  )
}
