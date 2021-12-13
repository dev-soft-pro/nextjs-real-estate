import React from 'react'
import { useRouter } from 'next/router'
import { ReactReduxContext } from 'react-redux'

import Button from 'components/Button'
import GeoAutocomplete from 'components/GeoAutocomplete/advanced'
import { MAP_PAGE } from 'consts/url'
import { viewUrlFromPlace } from 'utils/properties'
import { state2MapUrl } from 'utils/url'

import SvgBack from 'assets/images/icons/back.svg'

import styles from './styles.scss?type=global'

interface PageHeaderProps {
  keyword: string
  place?: TopHap.Place
}

export default function PageHeader({ place, ...props }: PageHeaderProps) {
  const [keyword, setKeyword] = React.useState(props.keyword)
  const [suggestion, setSuggestion] = React.useState(place)
  const context = React.useContext(ReactReduxContext)
  const router = useRouter()

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
      updatePlace(suggestion.place_name, suggestion)
    }
  }

  function onSuggestionSelected(suggestion: TopHap.Place) {
    setSuggestion(suggestion)
    updatePlace(suggestion.place_name, suggestion)
  }

  function onSuggestions(suggestions: TopHap.Place[]) {
    if (suggestions.length) {
      setSuggestion(suggestions[0])
    }
  }

  function updatePlace(keyword: string, place: TopHap.Place) {
    if (place.place_type[0] === 'address') {
      router.push(
        '/homes/details/[address]/[id]',
        viewUrlFromPlace(place.id, place)
      )
    } else {
      goMap(keyword, place)
    }
  }

  function goMap(keyword: string, place?: TopHap.Place) {
    // update keyword and place using state hash
    const store = context.store.getState()
    const newStore = {
      ...store,
      preferences: {
        ...store.preferences,
        keyword,
        place
      }
    }

    router.push(MAP_PAGE, state2MapUrl(newStore))
  }

  return (
    <div className='th-page-header'>
      <Button
        className='th-back-button'
        onClick={() => goMap(keyword, suggestion)}
      >
        <SvgBack />
        <span>Map</span>
      </Button>

      <div className='th-geo-search-container'>
        <GeoAutocomplete
          placeholder='Address, Neighborhood, City or ZIP'
          value={keyword}
          onChange={onChange}
          onClear={onClear}
          onSearch={onSearch}
          onSuggestionSelected={onSuggestionSelected}
          onSuggestions={onSuggestions}
        />
      </div>

      <style jsx>{styles}</style>
    </div>
  )
}
