import React from 'react'
import copy from 'copy-to-clipboard'
import NumAbbr from 'number-abbreviate'
import NumberFormat, { NumberFormatValues } from 'react-number-format'

import Button from 'components/Button'
import Snackbar from 'components/Snackbar'
import GeoAutocomplete from 'components/GeoAutocomplete/advanced'
import FilterOption from 'containers/MapView/SearchBar/Filter/components/FilterOption'
import FilterListOption from 'containers/MapView/SearchBar/Filter/components/FilterListOption'
import Checkbox from 'components/Checkbox'
import Switch from 'components/Switch'

import SvgShare from 'assets/images/icons/share.svg'
import { logEvent } from 'services/analytics'
import styles from './styles.scss?type=global'

const numAbbr = new NumAbbr(['K', 'M', 'G', 'T'])
const BREAK_WIDTH = 920

interface Props {
  accuracy: boolean
  filter: TopHap.CompareState['preferences']['filter']
  viewportWidth: number
  onAdd(place: TopHap.Place): void
  setOption: (option: string, value: any, update?: boolean) => void
}

export default function CompareHeader({
  accuracy,
  filter,
  viewportWidth,
  onAdd,
  setOption
}: Props) {
  const [keyword, setKeyword] = React.useState('')
  const [suggestion, setSuggestion] = React.useState<TopHap.Place | undefined>(
    undefined
  )

  const [minLivingArea, setMinLivingArea] = React.useState(
    filter.living_area.min
  )
  const [maxLivingArea, setMaxLivingArea] = React.useState(
    filter.living_area.max
  )
  const refFilters = React.useRef<HTMLDivElement>(null)

  function onChange(event: any, { newValue }: any) {
    setKeyword(newValue)
    if (!newValue) {
      setSuggestion(undefined)
    }
  }

  function onClear() {
    setKeyword('')
    setSuggestion(undefined)
  }

  function onSearch() {
    if (suggestion) {
      onAdd(suggestion)
    }
  }

  function onSuggestionSelected(suggestion: TopHap.Place) {
    setSuggestion(suggestion)
    onAdd(suggestion)
  }

  function onSuggestions(suggestions: TopHap.Place[]) {
    if (suggestions.length) {
      setSuggestion(suggestions[0])
    }
  }

  function setFilterOption(option: string, value: any, update?: boolean) {
    setOption(`filter.${option}`, value, update)

    logEvent('compare', 'filter', 'change', { option, value, update })
  }

  function _renderOption() {
    return (
      <FilterOption key='option' collapseOnClickoutside title='Options'>
        <div className='mx-3 mb-2'>
          <small>Rental:&nbsp;</small>
          <Switch
            checked={filter.rental}
            onChange={(_, checked) => setFilterOption('rental', checked)}
          />
        </div>
        <hr />
        <Checkbox
          label='Show accuracy'
          checked={accuracy}
          className='mt-1 ml-1'
          onChange={(_, checked) => {
            setOption('accuracy', checked)
          }}
        />
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
        collapseOnClickoutside
        containerClassName='th-type-option'
        title='Property Type'
        value={value}
        onClear={() => setFilterOption('property_type.values', [])}
      >
        <div style={{ width: '100%' }} className='mb-1'>
          <Checkbox
            label={'All'}
            checked={!property_type.values.length}
            onChange={(_, checked) => {
              if (checked) {
                setFilterOption('property_type.values', [])
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
                setFilterOption('property_type.values', [
                  ...property_type.values,
                  e
                ])
              } else {
                setFilterOption(
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
        setFilterOption('living_area', {
          min: maxLivingArea,
          max: minLivingArea
        })
      } else {
        setFilterOption('living_area', {
          min: minLivingArea,
          max: maxLivingArea
        })
      }
    }

    return (
      <FilterOption
        key='living_area'
        active={!!living_area.min || !!living_area.max}
        align='right'
        containerClassName='th-living-area-option'
        title='Living Area'
        value={value}
        onClear={() => setFilterOption('living_area', {})}
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

  function onShare() {
    copy(window.location.href)
    Snackbar.show({ message: 'Link copied to clipboard.' })

    logEvent('compare', 'share', null, { url: window.location.href })
  }

  const options = [
    _renderOption(),
    _renderTypeOption(),
    _renderLivingAreaOption()
  ]

  return (
    <div className='th-compare-header'>
      <GeoAutocomplete
        placeholder='Address, Neighborhood, City or ZIP'
        value={keyword}
        excludeStreets
        onChange={onChange}
        onClear={onClear}
        onSearch={onSearch}
        onSuggestionSelected={onSuggestionSelected}
        onSuggestions={onSuggestions}
      />

      <div className='th-options-container'>
        {viewportWidth > BREAK_WIDTH ? (
          options
        ) : (
          <FilterListOption
            tooltip='Filters'
            title='Filters'
            triggerRef={refFilters}
          >
            {options.map((e: any) =>
              React.cloneElement(e, { collapseOnClickoutside: false })
            )}
          </FilterListOption>
        )}
      </div>

      <div className='th-actions'>
        <Button className='th-action-button' onClick={onShare}>
          <span>Share</span>
          <SvgShare className='th-icon' />
        </Button>
      </div>
      <style jsx>{styles}</style>
    </div>
  )
}
