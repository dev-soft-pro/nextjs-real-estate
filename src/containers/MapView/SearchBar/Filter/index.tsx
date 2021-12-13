import React from 'react'
import cn from 'classnames'
import NumAbbr from 'number-abbreviate'
import NumberFormat, { NumberFormatValues } from 'react-number-format'
import ResizeDetector from 'react-resize-detector'

import Button from 'components/Button'
import Checkbox from 'components/Checkbox'
import Radio, { RadioGroup } from 'components/Radio'
import SearchableSelect from 'components/SearchableSelect'
import Select, { Option } from 'components/Select'
import Switch from 'components/Switch'
import FilterOption from './components/FilterOption'
import FilterListOption from './components/FilterListOption'

import SvgFilter from 'assets/images/icons/filter.svg'
import { BREAK_SM, SQFT_PER_ACRE } from 'consts'
import { propertyStatus } from 'consts/data_mapping'
import { logEvent } from 'services/analytics'

const numAbbr = new NumAbbr(['K', 'M', 'G', 'T'])

interface FilterProps {
  filter: TopHap.Filter
  viewportWidth: number
  clearAll(): void
  setFilterOption(option: string, value: any, update?: boolean): void
}

export default function Filter({
  filter,
  viewportWidth,
  clearAll,
  setFilterOption
}: FilterProps) {
  const refSizeOption = React.useRef<HTMLDivElement>(null)
  const refMoreFiltersTrigger = React.useRef<HTMLDivElement>(null)

  const [width, setWidth] = React.useState(0)
  const [minPrice, setMinPrice] = React.useState(filter.price.min)
  const [maxPrice, setMaxPrice] = React.useState(filter.price.max)
  const [minLivingArea, setMinLivingArea] = React.useState(
    filter.living_area.min
  )
  const [maxLivingArea, setMaxLivingArea] = React.useState(
    filter.living_area.max
  )
  const [minPriceSqft, setMinPriceSqft] = React.useState(
    filter.price_per_sqft.min
  )
  const [maxPriceSqft, setMaxPriceSqft] = React.useState(
    filter.price_per_sqft.max
  )
  const [minLotSize, setMinLotSize] = React.useState(filter.lot_size_acres.min)
  const [maxLotSize, setMaxLotSize] = React.useState(filter.lot_size_acres.max)
  const [lotScale, setLotScale] = React.useState<'acres' | 'sqft'>('acres')
  const [keywords, setKeywords] = React.useState(filter.description)

  React.useEffect(() => setMinPrice(filter.price.min), [filter.price.min])
  React.useEffect(() => setMaxPrice(filter.price.max), [filter.price.max])
  React.useEffect(() => setMinLivingArea(filter.living_area.min), [
    filter.living_area.min
  ])
  React.useEffect(() => setMaxLivingArea(filter.living_area.max), [
    filter.living_area.max
  ])
  React.useEffect(() => setMinPriceSqft(filter.price_per_sqft.min), [
    filter.price_per_sqft.min
  ])
  React.useEffect(() => setMaxPriceSqft(filter.price_per_sqft.max), [
    filter.price_per_sqft.max
  ])
  React.useEffect(
    () =>
      setMinLotSize(
        filter.lot_size_acres.min
          ? filter.lot_size_acres.min *
              (lotScale === 'acres' ? 1 : SQFT_PER_ACRE)
          : filter.lot_size_acres.min
      ),
    [filter.lot_size_acres.min]
  )
  React.useEffect(
    () =>
      setMaxLotSize(
        filter.lot_size_acres.max
          ? filter.lot_size_acres.max *
              (lotScale === 'acres' ? 1 : SQFT_PER_ACRE)
          : filter.lot_size_acres.max
      ),
    [filter.lot_size_acres.max]
  )
  React.useEffect(() => setKeywords(filter.description), [filter.description])

  const [, forceUpdate] = React.useState({})
  React.useEffect(() => {
    if (refSizeOption.current) {
      forceUpdate({})
    }
  }, [refSizeOption])

  function setOption(option: string, value: any, update?: boolean) {
    setFilterOption(option, value, update)

    logEvent('map', 'filter', 'change', {
      option,
      value,
      update
    })
  }

  function _renderStatusOption() {
    const { status } = filter
    const value = status.values.join()

    const options: TopHap.PropertyStatus[] = ['Active', 'Pending', 'Sold']
    const dateOptions = [
      { value: '', title: 'Any' },
      { value: 'now-1d/d', title: '1 Day' },
      { value: 'now-1M/d', title: '1 Month' },
      { value: 'now-2M/d', title: '2 Months' },
      { value: 'now-3M/d', title: '3 Months' },
      { value: 'now-4M/d', title: '4 Months' },
      { value: 'now-5M/d', title: '5 Months' },
      { value: 'now-6M/d', title: '6 Months' },
      { value: 'now-7M/d', title: '7 Months' },
      { value: 'now-8M/d', title: '8 Months' },
      { value: 'now-9M/d', title: '9 Months' },
      { value: 'now-10M/d', title: '10 Months' },
      { value: 'now-11M/d', title: '11 Months' },
      { value: 'now-1y/d', title: '1 Year' },
      { value: 'now-2y/d', title: '2 Years' }
    ]

    return (
      <FilterOption
        key='status'
        active={
          status.values.length !== 0 || status.close_date.min !== 'now-1M/d'
        }
        collapseOnClickoutside={false}
        containerClassName='th-status-option'
        title='Property Status'
        value={value}
        onClear={() =>
          setOption('status', { values: [], close_date: { min: 'now-1M/d' } })
        }
      >
        <div style={{ width: '100%' }} className='mb-1'>
          <Checkbox
            label='Any'
            checked={!status.values.length}
            onChange={(_, checked) => {
              if (checked) {
                setOption('status.values', [])
              }
            }}
          />
        </div>
        {options.map((s: TopHap.PropertyStatus) => (
          <Checkbox
            key={s}
            label={propertyStatus[s].title}
            checked={status.values.includes(s)}
            onChange={(_, checked) => {
              if (checked) {
                setOption('status.values', [...status.values, s])
              } else {
                setOption(
                  'status.values',
                  status.values.filter(e => e !== s)
                )
              }
            }}
          />
        ))}
        {status.values.includes('Sold') || !status.values.length ? (
          <div className='th-close-date p-3'>
            <label className='mb-1'>Sold Ago:</label>
            <SearchableSelect
              options={dateOptions}
              value={dateOptions.find(e => e.value === status.close_date?.min)}
              onChange={(_: any, option: any) => {
                if (option) {
                  setOption('status.close_date.min', option.value)
                }
              }}
            />
          </div>
        ) : null}
      </FilterOption>
    )
  }

  function _renderPriceOption() {
    const { price } = filter

    let value = ''
    if (price.min && price.max) {
      value = `$${numAbbr.abbreviate(price.min, 1)} - $${numAbbr.abbreviate(
        price.max,
        1
      )}`
    } else if (price.min && !price.max) {
      value = `$${numAbbr.abbreviate(price.min, 1)}+`
    } else if (!price.min && price.max) {
      value = `$0 - ${numAbbr.abbreviate(price.max, 1)}`
    }

    const minOptions = [
      0,
      500000,
      1000000,
      1500000,
      2000000,
      2500000,
      3000000,
      3500000
    ]
    const maxOptions = [
      500000,
      1000000,
      1500000,
      2000000,
      2500000,
      3000000,
      3500000,
      'Any Price'
    ]

    function _setValue() {
      if (Number(minPrice) > Number(maxPrice)) {
        setOption('price', { min: maxPrice, max: minPrice })
      } else {
        setOption('price', { min: minPrice, max: maxPrice })
      }
    }

    return (
      <FilterOption
        key='price'
        active={!!price.min || !!price.max}
        collapseOnClickoutside={false}
        containerClassName='th-price-option'
        title='Price'
        value={value}
        onClear={() => setOption('price', {})}
      >
        <div className='th-range-input'>
          <div className='d-flex justify-content-between'>
            <label className='th-label' htmlFor='min-price'>
              Minimum
            </label>
            <label className='th-label' htmlFor='max-price'>
              Maximum
            </label>
          </div>
          <div className='d-flex align-items-center'>
            <NumberFormat
              className='th-input'
              placeholder='$ No Min'
              prefix='$ '
              thousandSeparator
              value={minPrice || ''}
              onValueChange={(values: NumberFormatValues) =>
                setMinPrice(values.floatValue)
              }
              onKeyPress={e => {
                if (e.key === 'Enter') _setValue()
              }}
              onBlur={_setValue}
            />
            &nbsp;⎯⎯&nbsp;
            <NumberFormat
              className='th-input'
              placeholder='$ No Max'
              prefix='$ '
              thousandSeparator
              value={maxPrice || ''}
              onValueChange={(values: NumberFormatValues) =>
                setMaxPrice(values.floatValue)
              }
              onKeyPress={e => {
                if (e.key === 'Enter') _setValue()
              }}
              onBlur={_setValue}
            />
          </div>
        </div>
        <div className='d-flex'>
          <div className='th-prices align-items-start'>
            {minOptions.map(e => (
              <Button
                className={cn('th-option-button', {
                  'th-selected': e === Number(price.min)
                })}
                key={e}
                onClick={() => {
                  if (e && price.max) {
                    setOption('price', {
                      min: Math.min(e, price.max),
                      max: Math.max(e, price.max)
                    })
                  } else {
                    setOption('price', {
                      min: e,
                      max: price.max
                    })
                  }
                }}
              >
                ${numAbbr.abbreviate(e, 1)}
              </Button>
            ))}
          </div>
          <div className='th-prices align-items-end'>
            {maxOptions.map(e => (
              <Button
                className={cn('th-option-button', {
                  'th-selected': e === Number(price.max)
                })}
                key={e}
                onClick={() => {
                  const max = e === 'Any Price' ? undefined : Number(e)
                  if (price.min && max) {
                    setOption('price', {
                      min: Math.min(max, price.min),
                      max: Math.max(max, price.min)
                    })
                  } else {
                    setOption('price', {
                      min: price.min,
                      max
                    })
                  }
                }}
              >
                {e === 'Any Price' ? e : `$${numAbbr.abbreviate(e, 1)}`}
              </Button>
            ))}
          </div>
        </div>
      </FilterOption>
    )
  }

  function _renderTypeOption() {
    const { property_type } = filter

    const options: TopHap.PropertyType[] = [
      'Commercial',
      'Condo',
      'House',
      'Land',
      'Multi-family',
      'Townhouse',
      'Other'
    ]

    const value = property_type.values.join()

    return (
      <FilterOption
        key='types'
        active={!!property_type.values.length}
        collapseOnClickoutside={false}
        containerClassName='th-type-option'
        title='Property Type'
        value={value}
        onClear={() => setOption('property_type.values', [])}
      >
        <div style={{ width: '100%' }} className='mb-1'>
          <Checkbox
            label={'All'}
            checked={!property_type.values.length}
            onChange={(_, checked) => {
              if (checked) {
                setOption('property_type.values', [])
              }
            }}
          />
        </div>
        {options.map(e => (
          <Checkbox
            key={e}
            label={e}
            checked={property_type.values.includes(e)}
            onChange={(_, checked) => {
              if (checked) {
                setOption('property_type.values', [...property_type.values, e])
              } else {
                setOption(
                  'property_type.values',
                  property_type.values.filter(
                    (type: TopHap.PropertyType) => type !== e
                  )
                )
              }
            }}
          />
        ))}
      </FilterOption>
    )
  }

  function _renderBedsOption() {
    const { bedrooms } = filter

    let value = ''
    if (bedrooms.min && bedrooms.max) {
      value = `${bedrooms.min} - ${bedrooms.max} Beds`
    } else if (bedrooms.min && !bedrooms.max) {
      value = `${bedrooms.min}+ Beds`
    } else if (!bedrooms.min && bedrooms.max) {
      value = `Any - ${bedrooms.max} Beds`
    }

    return (
      <FilterOption
        key='bedrooms'
        active={!!bedrooms.min || !!bedrooms.max}
        collapseOnClickoutside={false}
        containerClassName='th-beds-option'
        title='Bedrooms'
        value={value}
        onClear={() => setOption('bedrooms', {})}
      >
        <div className='d-flex'>
          <Button
            className={cn('th-option-button', {
              'th-selected': bedrooms.min === 0
            })}
            onClick={() => setOption('bedrooms', { min: 0 })}
          >
            Any
          </Button>
          {[1, 2, 3, 4, 5].map(e => (
            <Button
              key={e}
              className={cn('th-option-button', {
                'th-selected': bedrooms.min === e && !bedrooms.max
              })}
              onClick={() => setOption('bedrooms', { min: e })}
            >
              {e}+
            </Button>
          ))}
        </div>
        {bedrooms.min !== undefined ? (
          <React.Fragment>
            <hr className='mt-3' />
            <label className='th-label my-2 ml-4'>Set specific range</label>
            <div className='d-flex align-items-center mb-1'>
              <Select
                value={Number(bedrooms.min) || 'Any'}
                onChange={e => {
                  const min =
                    e.target.value === 'Any' ? 0 : Number(e.target.value)

                  if (bedrooms.max && min) {
                    setOption('bedrooms', {
                      min: Math.min(min, bedrooms.max),
                      max: Math.max(min, bedrooms.max)
                    })
                  } else {
                    setOption('bedrooms', {
                      min,
                      max: bedrooms.max
                    })
                  }
                }}
              >
                {['Any', 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(e => (
                  <Option key={e} value={e}>
                    {e}
                  </Option>
                ))}
              </Select>
              &nbsp;⎯&nbsp;
              <Select
                value={Number(bedrooms.max) || 'Any'}
                onChange={e => {
                  const max =
                    e.target.value === 'Any'
                      ? undefined
                      : Number(e.target.value)

                  if (max && bedrooms.min) {
                    setOption('bedrooms', {
                      min: Math.min(bedrooms.min, max),
                      max: Math.max(bedrooms.min, max)
                    })
                  } else {
                    setOption('bedrooms', {
                      min: bedrooms.min,
                      max
                    })
                  }
                }}
              >
                {['Any', 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(e => (
                  <Option key={e} value={e}>
                    {e}
                  </Option>
                ))}
              </Select>
            </div>
          </React.Fragment>
        ) : null}
      </FilterOption>
    )
  }

  function _renderBathsOption() {
    const { bathrooms } = filter

    let value = ''
    if (bathrooms.min && bathrooms.max) {
      value = `${bathrooms.min} - ${bathrooms.max} Baths`
    } else if (bathrooms.min && !bathrooms.max) {
      value = `${bathrooms.min}+ Baths`
    } else if (!bathrooms.min && bathrooms.max) {
      value = `Any - ${bathrooms.max} Baths`
    }

    return (
      <FilterOption
        key='bathrooms'
        active={!!bathrooms.min || !!bathrooms.max}
        collapseOnClickoutside={false}
        containerClassName='th-baths-option'
        title='Bathrooms'
        value={value}
        onClear={() => setOption('bathrooms', {})}
      >
        <div className='d-flex'>
          <Button
            className={cn('th-option-button', {
              'th-selected': bathrooms.min === 0
            })}
            onClick={() => setOption('bathrooms', { min: 0 })}
          >
            Any
          </Button>
          {[1, 2, 3, 4, 5].map(e => (
            <Button
              key={e}
              className={cn('th-option-button', {
                'th-selected': bathrooms.min === e && !bathrooms.max
              })}
              onClick={() => setOption('bathrooms', { min: e })}
            >
              {e}+
            </Button>
          ))}
        </div>
        {bathrooms.min !== undefined ? (
          <React.Fragment>
            <hr className='mt-3' />
            <label className='th-label my-2 ml-4'>Set specific range</label>
            <div className='d-flex align-items-center mb-1'>
              <Select
                value={Number(bathrooms.min) || 'Any'}
                onChange={e => {
                  const min =
                    e.target.value === 'Any' ? 0 : Number(e.target.value)

                  if (bathrooms.max && min) {
                    setOption('bathrooms', {
                      min: Math.min(min, bathrooms.max),
                      max: Math.max(min, bathrooms.max)
                    })
                  } else {
                    setOption('bathrooms', {
                      min,
                      max: bathrooms.max
                    })
                  }
                }}
              >
                {['Any', 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(e => (
                  <Option key={e} value={e}>
                    {e}
                  </Option>
                ))}
              </Select>
              &nbsp;⎯&nbsp;
              <Select
                value={Number(bathrooms.max) || 'Any'}
                onChange={e => {
                  const max =
                    e.target.value === 'Any'
                      ? undefined
                      : Number(e.target.value)

                  if (max && bathrooms.min) {
                    setOption('bathrooms', {
                      min: Math.min(bathrooms.min, max),
                      max: Math.max(bathrooms.min, max)
                    })
                  } else {
                    setOption('bathrooms', {
                      min: bathrooms.min,
                      max
                    })
                  }
                }}
              >
                {['Any', 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(e => (
                  <Option key={e} value={e}>
                    {e}
                  </Option>
                ))}
              </Select>
            </div>
          </React.Fragment>
        ) : null}
      </FilterOption>
    )
  }

  function _renderLivingAreaOption() {
    const { living_area } = filter

    let value = ''
    if (living_area.min && living_area.max) {
      value = `${numAbbr.abbreviate(living_area.min, 1)} - ${numAbbr.abbreviate(
        living_area.max,
        1
      )} ft²`
    } else if (living_area.min && !living_area.max) {
      value = `${numAbbr.abbreviate(living_area.min, 1)}+ ft²`
    } else if (!living_area.min && living_area.max) {
      value = `0 - ${numAbbr.abbreviate(living_area.max, 1)} ft²`
    }

    function _setValue() {
      if (Number(minLivingArea) > Number(maxLivingArea)) {
        setOption('living_area', { min: maxLivingArea, max: minLivingArea })
      } else {
        setOption('living_area', { min: minLivingArea, max: maxLivingArea })
      }
    }

    return (
      <FilterOption
        key='living_area'
        active={!!living_area.min || !!living_area.max}
        collapseOnClickoutside={false}
        containerClassName='th-living-area-option'
        title='Living Area'
        value={value}
        onClear={() => setOption('living_area', {})}
      >
        <div className='th-range-input'>
          <div className='d-flex justify-content-between'>
            <label className='th-label' htmlFor='min-living-area'>
              Minimum
            </label>
            <label className='th-label' htmlFor='max-living-area'>
              Maximum
            </label>
          </div>
          <div className='d-flex align-items-center'>
            <NumberFormat
              className='th-input'
              placeholder='No Min'
              suffix=' ft²'
              thousandSeparator
              value={minLivingArea || ''}
              onValueChange={(values: NumberFormatValues) =>
                setMinLivingArea(values.floatValue)
              }
              onKeyPress={e => {
                if (e.key === 'Enter') _setValue()
              }}
              onBlur={_setValue}
            />
            &nbsp;⎯⎯&nbsp;
            <NumberFormat
              className='th-input'
              placeholder='No Max'
              suffix=' ft²'
              thousandSeparator
              value={maxLivingArea || ''}
              onValueChange={(values: NumberFormatValues) =>
                setMaxLivingArea(values.floatValue)
              }
              onKeyPress={e => {
                if (e.key === 'Enter') _setValue()
              }}
              onBlur={_setValue}
            />
          </div>
        </div>
      </FilterOption>
    )
  }

  function _renderLotSizeOption() {
    const { lot_size_acres } = filter

    let value = ''
    if (lot_size_acres.min && lot_size_acres.max) {
      value = `${numAbbr.abbreviate(
        lot_size_acres.min.toFixed(4),
        1
      )} - ${numAbbr.abbreviate(lot_size_acres.max.toFixed(4), 1)} acres`
    } else if (lot_size_acres.min && !lot_size_acres.max) {
      value = `${numAbbr.abbreviate(lot_size_acres.min.toFixed(4), 1)}+ acres`
    } else if (!lot_size_acres.min && lot_size_acres.max) {
      value = `0 - ${numAbbr.abbreviate(
        lot_size_acres.max.toFixed(4),
        1
      )} acres`
    }

    function _setValue() {
      const factor = lotScale === 'acres' ? 1 : SQFT_PER_ACRE
      const min = minLotSize ? minLotSize / factor : undefined
      const max = maxLotSize ? maxLotSize / factor : undefined

      if (Number(min) > Number(max)) {
        setOption('lot_size_acres', { min: max, max: min })
      } else {
        setOption('lot_size_acres', { min: min, max: max })
      }
    }

    return (
      <FilterOption
        key='lot_size'
        active={!!lot_size_acres.min || !!lot_size_acres.max}
        align='right'
        collapseOnClickoutside={false}
        containerClassName='th-lot-size-option'
        title='Lot Size'
        value={value}
        onClear={() => setOption('lot_size_acres', {})}
      >
        <div className='ml-2'>
          <RadioGroup
            value={lotScale}
            onChange={(e: any) => {
              if (e.target.value !== lotScale) {
                if (lotScale === 'acres') {
                  setMinLotSize(
                    minLotSize ? minLotSize * SQFT_PER_ACRE : minLotSize
                  )
                  setMaxLotSize(
                    maxLotSize ? maxLotSize * SQFT_PER_ACRE : maxLotSize
                  )
                } else {
                  setMinLotSize(
                    minLotSize ? minLotSize / SQFT_PER_ACRE : minLotSize
                  )
                  setMaxLotSize(
                    maxLotSize ? maxLotSize / SQFT_PER_ACRE : maxLotSize
                  )
                }
              }
              setLotScale(e.target.value)
            }}
            row
          >
            <Radio label='Sqft' value='sqft' />
            <Radio label='Acres' value='acres' />
          </RadioGroup>
        </div>
        <div className='th-range-input'>
          <div className='d-flex justify-content-between'>
            <label className='th-label' htmlFor='min-lot-size'>
              Minimum
            </label>
            <label className='th-label' htmlFor='max-lot-size'>
              Maximum
            </label>
          </div>
          <div className='d-flex align-items-center'>
            <NumberFormat
              className='th-input'
              placeholder='No Min'
              prefix=''
              thousandSeparator
              value={minLotSize || ''}
              onValueChange={(values: NumberFormatValues) =>
                setMinLotSize(values.floatValue)
              }
              onKeyPress={e => {
                if (e.key === 'Enter') _setValue()
              }}
              onBlur={_setValue}
            />
            &nbsp;⎯⎯&nbsp;
            <NumberFormat
              className='th-input'
              placeholder='No Max'
              prefix=''
              thousandSeparator
              value={maxLotSize || ''}
              onValueChange={(values: NumberFormatValues) =>
                setMaxLotSize(values.floatValue)
              }
              onKeyPress={e => {
                if (e.key === 'Enter') _setValue()
              }}
              onBlur={_setValue}
            />
          </div>
        </div>
      </FilterOption>
    )
  }

  function _renderGaragesOption() {
    const { garage } = filter

    let value = ''
    if (garage.min && garage.max) {
      value = `${garage.min} - ${garage.max} Garages`
    } else if (garage.min && !garage.max) {
      value = `${garage.min}+ Garages`
    } else if (!garage.min && garage.max) {
      value = `Any - ${garage.max} Garages`
    }

    return (
      <FilterOption
        key='garage'
        active={!!garage.min || !!garage.max}
        align='right'
        collapseOnClickoutside={false}
        containerClassName='th-garages-option'
        title='Garages'
        value={value}
        onClear={() => setOption('garage', {})}
      >
        <div className='d-flex'>
          <Button
            className={cn('th-option-button', {
              'th-selected': garage.min === 0
            })}
            onClick={() => setOption('garage', { min: 0 })}
          >
            Any
          </Button>
          {[1, 2, 3, 4, 5].map(e => (
            <Button
              key={e}
              className={cn('th-option-button', {
                'th-selected': garage.min === e && !garage.max
              })}
              onClick={() => setOption('garage', { min: e })}
            >
              {e}+
            </Button>
          ))}
        </div>
        {garage.min !== undefined ? (
          <React.Fragment>
            <hr className='mt-3' />
            <label className='th-label my-2 ml-4'>Set specific range</label>
            <div className='d-flex align-items-center mb-1'>
              <Select
                value={Number(garage.min) || 'Any'}
                onChange={e => {
                  const min =
                    e.target.value === 'Any' ? 0 : Number(e.target.value)

                  if (garage.max && min) {
                    setOption('garage', {
                      min: Math.min(min, garage.max),
                      max: Math.max(min, garage.max)
                    })
                  } else {
                    setOption('garage', {
                      min,
                      max: garage.max
                    })
                  }
                }}
              >
                {['Any', 1, 2, 3, 4, 5].map(e => (
                  <Option key={e} value={e}>
                    {e}
                  </Option>
                ))}
              </Select>
              &nbsp;⎯&nbsp;
              <Select
                value={Number(garage.max) || 'Any'}
                onChange={e => {
                  const max =
                    e.target.value === 'Any'
                      ? undefined
                      : Number(e.target.value)

                  if (max && garage.min) {
                    setOption('garage', {
                      min: Math.min(garage.min, max),
                      max: Math.max(garage.min, max)
                    })
                  } else {
                    setOption('garage', {
                      min: garage.min,
                      max
                    })
                  }
                }}
              >
                {['Any', 1, 2, 3, 4, 5].map(e => (
                  <Option key={e} value={e}>
                    {e}
                  </Option>
                ))}
              </Select>
            </div>
          </React.Fragment>
        ) : null}
      </FilterOption>
    )
  }

  function _renderPriceSqftOption() {
    const { price_per_sqft } = filter

    let value = ''
    if (price_per_sqft.min && price_per_sqft.max) {
      value = `$${numAbbr.abbreviate(
        price_per_sqft.min,
        1
      )} - $${numAbbr.abbreviate(price_per_sqft.max, 1)} / ft²`
    } else if (price_per_sqft.min && !price_per_sqft.max) {
      value = `$${numAbbr.abbreviate(price_per_sqft.min, 1)}+ / ft²`
    } else if (!price_per_sqft.min && price_per_sqft.max) {
      value = `0 - $${numAbbr.abbreviate(price_per_sqft.max, 1)} / ft²`
    }

    function _setValue() {
      if (Number(minPriceSqft) > Number(maxPriceSqft)) {
        setOption('price_per_sqft', { min: maxPriceSqft, max: minPriceSqft })
      } else {
        setOption('price_per_sqft', { min: minPriceSqft, max: maxPriceSqft })
      }
    }

    return (
      <FilterOption
        key='price_per_sqft'
        active={!!price_per_sqft.min || !!price_per_sqft.max}
        align='right'
        collapseOnClickoutside={false}
        containerClassName='th-pricesqft-option'
        title='Price / ft²'
        value={value}
        onClear={() => setOption('price_per_sqft', {})}
      >
        <div className='th-range-input'>
          <div className='d-flex justify-content-between'>
            <label className='th-label' htmlFor='min-price-sqft'>
              Minimum
            </label>
            <label className='th-label' htmlFor='max-price-sqft'>
              Maximum
            </label>
          </div>
          <div className='d-flex align-items-center'>
            <NumberFormat
              className='th-input'
              placeholder='No Min'
              prefix='$ '
              thousandSeparator
              value={minPriceSqft || ''}
              onValueChange={(values: NumberFormatValues) =>
                setMinPriceSqft(values.floatValue)
              }
              onKeyPress={e => {
                if (e.key === 'Enter') _setValue()
              }}
              onBlur={_setValue}
            />
            &nbsp;⎯⎯&nbsp;
            <NumberFormat
              className='th-input'
              placeholder='No Max'
              prefix='$ '
              thousandSeparator
              value={maxPriceSqft || ''}
              onValueChange={(values: NumberFormatValues) =>
                setMaxPriceSqft(values.floatValue)
              }
              onKeyPress={e => {
                if (e.key === 'Enter') _setValue()
              }}
              onBlur={_setValue}
            />
          </div>
        </div>
      </FilterOption>
    )
  }

  function _renderYearBuiltOption() {
    const { year_built } = filter

    let value = ''
    if (year_built.min && year_built.max) {
      value = `${year_built.min} - ${year_built.max} Year Built`
    } else if (year_built.min && !year_built.max) {
      value = `${year_built.min}+ Year Built`
    } else if (!year_built.min && year_built.max) {
      value = `Any - ${year_built.max} Year Built`
    }

    const currentYear = new Date().getFullYear()

    type OptionType = { value: number | undefined; title: string }
    const options: OptionType[] = [
      {
        value: undefined,
        title: 'Any'
      }
    ]
    for (let i = currentYear; i >= 1950; --i) {
      options.push({ value: i, title: i.toString() })
    }

    return (
      <FilterOption
        key='year_built'
        active={!!year_built.min || !!year_built.max}
        align='right'
        collapseOnClickoutside={false}
        containerClassName='th-year-built-option'
        title='Year Built'
        value={value}
        onClear={() => setOption('year_built', {})}
      >
        <div className='d-flex align-items-center mb-1'>
          <SearchableSelect
            options={options}
            value={options.find(e => e.value === year_built.min)}
            onChange={(_: any, option: OptionType) => {
              if (option) {
                const min = option.value

                if (year_built.max && min) {
                  setOption('year_built', {
                    min: Math.min(min, year_built.max),
                    max: Math.max(min, year_built.max)
                  })
                } else {
                  setOption('year_built', {
                    min,
                    max: year_built.max
                  })
                }
              }
            }}
          />
          &nbsp;⎯&nbsp;
          <SearchableSelect
            options={options}
            value={options.find(e => e.value === year_built.max)}
            onChange={(_: any, option: OptionType) => {
              if (option) {
                const max = option.value

                if (max && year_built.min) {
                  setOption('year_built', {
                    min: Math.min(year_built.min, max),
                    max: Math.max(year_built.min, max)
                  })
                } else {
                  setOption('year_built', {
                    min: year_built.min,
                    max
                  })
                }
              }
            }}
          />
        </div>
      </FilterOption>
    )
  }

  function _renderStoriesOption() {
    const { stories } = filter

    let value = ''
    if (stories.min && stories.max) {
      value = `${stories.min} - ${stories.max} Stories`
    } else if (stories.min && !stories.max) {
      value = `${stories.min}+ Stories`
    } else if (!stories.min && stories.max) {
      value = `Any - ${stories.max} Stories`
    }

    return (
      <FilterOption
        key='stories'
        active={!!stories.min || !!stories.max}
        align='right'
        collapseOnClickoutside={false}
        containerClassName='th-stories-option'
        title='Stories'
        value={value}
        onClear={() => setOption('stories', {})}
      >
        <div className='d-flex'>
          <Button
            className={cn('th-option-button', {
              'th-selected': stories.min === 0
            })}
            onClick={() => setOption('stories', { min: 0 })}
          >
            Any
          </Button>
          {[1, 2, 3, 4, 5].map(e => (
            <Button
              key={e}
              className={cn('th-option-button', {
                'th-selected': stories.min === e && !stories.max
              })}
              onClick={() => setOption('stories', { min: e })}
            >
              {e}+
            </Button>
          ))}
        </div>
        {stories.min !== undefined ? (
          <React.Fragment>
            <hr className='mt-3' />
            <label className='th-label my-2 ml-4'>Set specific range</label>
            <div className='d-flex align-items-center mb-1'>
              <Select
                value={Number(stories.min) || 'Any'}
                onChange={e => {
                  const min =
                    e.target.value === 'Any' ? 0 : Number(e.target.value)

                  if (stories.max && min) {
                    setOption('stories', {
                      min: Math.min(min, stories.max),
                      max: Math.max(min, stories.max)
                    })
                  } else {
                    setOption('stories', {
                      min,
                      max: stories.max
                    })
                  }
                }}
              >
                {['Any', 1, 2, 3, 4, 5].map(e => (
                  <Option key={e} value={e}>
                    {e}
                  </Option>
                ))}
              </Select>
              &nbsp;⎯&nbsp;
              <Select
                value={Number(stories.max) || 'Any'}
                onChange={e => {
                  const max =
                    e.target.value === 'Any'
                      ? undefined
                      : Number(e.target.value)

                  if (max && stories.min) {
                    setOption('stories', {
                      min: Math.min(stories.min, max),
                      max: Math.max(stories.min, max)
                    })
                  } else {
                    setOption('stories', {
                      min: stories.min,
                      max
                    })
                  }
                }}
              >
                {['Any', 1, 2, 3, 4, 5].map(e => (
                  <Option key={e} value={e}>
                    {e}
                  </Option>
                ))}
              </Select>
            </div>
          </React.Fragment>
        ) : null}
      </FilterOption>
    )
  }

  function _renderDescriptionOption() {
    const { description } = filter

    return (
      <FilterOption
        key='description'
        active={!!description}
        align='right'
        collapseOnClickoutside={false}
        containerClassName='th-description-option'
        title='Keywords'
        value={keywords}
        onClear={() => setOption('description', '')}
      >
        <label className='th-label' htmlFor='max-price-sqft'>
          Keywords
        </label>
        <input
          className='th-input'
          placeholder='Keyword'
          value={keywords}
          onChange={ev => setKeywords(ev.target.value)}
          onKeyPress={ev => {
            if (ev.key === 'Enter') {
              setOption('description', keywords)
            }
          }}
          onBlur={() => setOption('description', keywords)}
        />
      </FilterOption>
    )
  }

  function _getFilterOptions(): [React.ReactElement[], React.ReactElement[]] {
    const filters: React.ReactElement[] = [
      _renderStatusOption(),
      _renderTypeOption(),
      _renderPriceOption(),
      _renderBedsOption(),
      _renderBathsOption(),
      _renderLivingAreaOption(),
      _renderLotSizeOption(),
      _renderGaragesOption(),
      _renderPriceSqftOption(),
      _renderYearBuiltOption(),
      _renderStoriesOption(),
      _renderDescriptionOption()
    ]

    if (refSizeOption.current && viewportWidth > BREAK_SM) {
      const sizeOption = refSizeOption.current as HTMLDivElement
      const moreWidth =
        (refMoreFiltersTrigger.current
          ? refMoreFiltersTrigger.current.offsetWidth
          : 0) + 10

      let i,
        spent = 0
      const eleTitle = sizeOption.children[1].children[0] as HTMLDivElement
      const eleValue = sizeOption.children[1].children[1] as HTMLDivElement
      for (i = 0; i < filters.length; ++i) {
        eleTitle.innerText = filters[i].props.title
        eleValue.innerText = filters[i].props.value
        spent += sizeOption.offsetWidth + 10

        if (spent + (i === filters.length - 1 ? 0 : moreWidth) > width) break
      }

      return [
        filters
          .slice(0, i)
          .map((e: any) =>
            React.cloneElement(e, { collapseOnClickoutside: true })
          ),
        filters.slice(i)
      ]
    } else {
      return [[], filters]
    }
  }

  function onToggleMoreFilters(expanded: boolean) {
    document.body.classList.toggle('th-filters-showed', expanded)

    logEvent(
      'map',
      'filter',
      viewportWidth <= BREAK_SM ? 'click_mobile' : 'click_more',
      { expanded }
    )
  }

  function handleClearAll() {
    clearAll()

    logEvent('map', 'clear_all_filters')
  }

  const [filters, moreFilters] = _getFilterOptions()

  return (
    <div className='th-filters'>
      <ResizeDetector handleWidth onResize={setWidth} />

      {viewportWidth <= BREAK_SM ? (
        <Button
          className='th-filter-button'
          onClick={() => {
            if (refMoreFiltersTrigger.current) {
              refMoreFiltersTrigger.current.click()
            }
          }}
        >
          <span>Filters</span>
          <SvgFilter className='th-icon' />
        </Button>
      ) : null}
      {/* this is for measuring size of options to support more options */}
      <FilterOption
        title=''
        className='th-size-option'
        triggerRef={refSizeOption}
      />

      {filters}

      {moreFilters.length ? (
        <FilterListOption
          key='more'
          collapseOnClickoutside={viewportWidth > BREAK_SM}
          tooltip='More Filters'
          triggerRef={refMoreFiltersTrigger}
          title='More'
          onClearAll={handleClearAll}
          onToggle={onToggleMoreFilters}
        >
          {moreFilters}
        </FilterListOption>
      ) : null}
    </div>
  )
}
