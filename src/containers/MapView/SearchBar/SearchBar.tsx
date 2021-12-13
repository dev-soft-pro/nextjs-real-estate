import React from 'react'
import copy from 'copy-to-clipboard'
import Filter from './Filter'
import GeoSearch from './GeoSearch'

import Button from 'components/Button'
import Snackbar from 'components/Snackbar'
import Tooltip from 'components/Tooltip'

import SvgShare from 'assets/images/icons/share.svg'
import { logEvent } from 'services/analytics'
import styles from './styles.scss?type=global'

interface SearchBarProps {
  asyncStatus: TopHap.GlobalState['status']
  filter: TopHap.PreferencesState['filter']
  keyword: string
  place?: TopHap.Place
  viewportWidth: number
  resetFilters(): void
  setFilterOption(option: string, value: any): void
  updateKeyword(keyword: string): void
  updatePlace(place?: TopHap.Place): void
}

export default function SearchBar({
  asyncStatus,
  filter,
  keyword,
  place,
  viewportWidth,
  resetFilters,
  setFilterOption,
  updateKeyword,
  updatePlace
}: SearchBarProps) {
  function onSearch(keyword: string, place?: TopHap.Place) {
    updateKeyword(keyword)
    updatePlace(place)

    logEvent('map', 'search', null, { keyword })
  }

  function onShare() {
    copy(window.location.href)
    Snackbar.show({ message: 'Link copied to clipboard.' })
    logEvent('map', 'share', null, { url: window.location.href })
  }

  return (
    <div className='th-search-bar'>
      <GeoSearch
        asyncStatus={asyncStatus}
        keyword={keyword}
        place={place}
        onSearch={onSearch}
      />
      <Filter
        filter={filter}
        setFilterOption={setFilterOption}
        clearAll={resetFilters}
        viewportWidth={viewportWidth}
      />

      <div className='th-actions'>
        <Tooltip
          tooltip='Copy Map Link to Clipboard'
          trigger='hover'
          placement='left'
        >
          <Button className='th-action-button' onClick={onShare}>
            <span>Share</span>
            <SvgShare className='th-icon' />
          </Button>
        </Tooltip>
      </div>

      <style jsx>{styles}</style>
    </div>
  )
}
