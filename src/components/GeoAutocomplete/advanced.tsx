import React from 'react'
import GeoAutocomplete from './index'
import cn from 'classnames'
import Button from 'components/Button'

import SvgSpinner from 'assets/images/icons/dual-ring.svg'
import SvgSearch from 'assets/images/icons/search.svg'
import SvgClose from 'assets/images/icons/close.svg'
import styles from './styles.scss?type=global'

export default function AdvancedGeoAutocomplete({
  autoFocus,
  placeholder,
  loading,
  searchTitle,
  value,
  onChange,
  onClear,
  onSearch,
  inputProps,
  ...props
}: any) {
  function handleClear() {
    if (onClear) onClear()

    const input = document.getElementById('th-geo-input')
    if (input) {
      setTimeout(() => {
        input.focus()
      })
    }
  }

  const Icon = props.Icon || SvgSearch

  return (
    <div className='th-geo-search'>
      <GeoAutocomplete
        inputProps={{
          value,
          autoFocus,
          placeholder,
          onChange,
          ...inputProps
        }}
        {...props}
      />
      {value && (
        <Button
          className='th-clear-button'
          aria-label='Clear'
          onClick={handleClear}
        >
          <SvgClose />
        </Button>
      )}
      <Button className='th-search-button' onClick={onSearch}>
        {searchTitle}
        <Icon className='th-search-icon' />
        <SvgSpinner
          className={cn('th-spinner', {
            'th-hide': !loading
          })}
        />
      </Button>

      <style jsx>{styles}</style>
    </div>
  )
}
