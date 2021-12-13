import React, { useEffect, useMemo, useRef, useState } from 'react'
import Autosuggest from 'react-autosuggest'
import match from 'autosuggest-highlight/match'
import parse from 'autosuggest-highlight/parse'
import cn from 'classnames'
import debounce from 'lodash/debounce'

import { searchAddresses as searchPlaces } from 'services/geo'
import { useIsMounted } from 'utils/hook'

export interface GeoAutocompleteProps {
  className: string
  excludeStreets?: boolean
  inputProps: Autosuggest.InputProps<TopHap.Place>
  recent: TopHap.UserState['recent']
  getRecentSearches: TopHap.UserCreators['getRecentSearches']
  addRecentSearch: TopHap.UserCreators['addRecentSearch']
  onSuggestions(suggestions: TopHap.Place[]): void
  onSuggestionSelected(suggestion: TopHap.Place): void
  updateMode(payload: any): void
}

type SuggestionSection = {
  title?: string
  suggestions: TopHap.Place[]
}

export default function GeoAutocomplete({
  className,
  excludeStreets,
  inputProps,
  recent,
  getRecentSearches,
  addRecentSearch,
  onSuggestions,
  onSuggestionSelected,
  updateMode
}: GeoAutocompleteProps) {
  const [suggestions, setSuggestions] = useState([])
  const memoizedSuggestions: SuggestionSection[] = useMemo(
    () =>
      inputProps.value.length
        ? [{ suggestions }]
        : ([
            recent.searches.length && {
              title: 'PREVIOUS SEARCHES',
              suggestions: recent.searches.filter(
                e => !(excludeStreets && e.place_type[0] === 'street')
              )
            },
            recent.views.length && {
              title: 'RECENTLY VIEWED',
              suggestions: recent.views.map(e => ({
                ...e,
                isViewed: true
              }))
            }
          ].filter(e => e) as SuggestionSection[]),
    // eslint-disable-next-line
    [suggestions, recent, excludeStreets]
  )
  const isMounted = useIsMounted()
  const lastSearched = useRef<string>('')

  useEffect(() => {
    document.addEventListener('touchend', onTouchEnd)
    return () => {
      document.removeEventListener('touchend', onTouchEnd)
    }
  })

  function placeType(placetype: TopHap.PlaceType) {
    switch (placetype) {
      case 'postcode':
        return 'ZIP Code'
      default:
        return placetype
    }
  }

  function renderSuggestionsContainer({
    containerProps,
    children
  }: Autosuggest.RenderSuggestionsContainerParams) {
    return <div {...containerProps}>{children}</div>
  }

  function renderInputComponent(props: any) {
    // wrap input by form to off auto complete feature on Chrome
    return (
      <form
        autoComplete='off'
        className='th-input-wrapper'
        onSubmit={e => e.preventDefault()}
      >
        <input {...props} />
      </form>
    )
  }

  function renderSuggestion(
    suggestion: TopHap.Place,
    { query, isHighlighted }: Autosuggest.RenderSuggestionParams
  ) {
    const label = suggestion.place_name.replace(/, United States/g, '')
    const matches = match(label, query)
    const parts = parse(label, matches)

    return (
      <>
        <div className={cn('th-address', { 'th-highlight': isHighlighted })}>
          {parts.map((part, index) =>
            part.highlight ? (
              <strong key={index} className='th-highlight-text'>
                {part.text}
              </strong>
            ) : (
              <span key={index}>{part.text}</span>
            )
          )}
        </div>
        <div className='th-address-type'>
          {placeType(suggestion.place_type[0])}
        </div>
      </>
    )
  }

  async function getSuggestions(value: string) {
    const inputValue = value.trim().toLowerCase()
    const inputLength = inputValue.length

    if (inputLength === 0) {
      return { input: value, suggestions: [] }
    } else {
      const res = await searchPlaces({
        input: inputValue,
        excludeStreets
      })

      return { input: value, suggestions: res.suggests }
    }
  }

  function getSuggestionValue(suggestion: TopHap.Place) {
    return suggestion.place_name.replace(/, United States/g, '')
  }

  function renderSectionTitle(section: SuggestionSection) {
    return section.title
  }

  function getSectionSuggestions(section: SuggestionSection) {
    return section.suggestions
  }

  function shouldRenderSuggestions() {
    return true
  }

  function _blurInput() {
    setTimeout(() => {
      const input = document.getElementById('th-geo-input')
      if (input) input.blur()
    }, 30)
  }

  function onTouchEnd(e: any) {
    const ele = document.getElementsByClassName('th-geo-autocomplete')[0]

    if (ele && !ele.contains(e.target)) {
      _blurInput()
    }
  }

  const handleSuggestionsFetchRequested = debounce(async ({ value }) => {
    lastSearched.current = value
    const res = await getSuggestions(value)
    if (res.input !== lastSearched.current) return

    // prevent update state after unmount
    if (isMounted.current) {
      setSuggestions(res.suggestions)
    }
    if (onSuggestions) {
      onSuggestions(res.suggestions)
    }
  }, 100)

  function handleSuggestionsClearRequested() {
    setSuggestions([])
    if (onSuggestions) {
      onSuggestions([])
    }
  }

  function handleSuggestionSelected(
    event: React.FormEvent<any>,
    data: Autosuggest.SuggestionSelectedEventData<TopHap.Place>
  ) {
    onSuggestionSelected(data.suggestion)
    if (!data.suggestion.isViewed) {
      addRecentSearch(data.suggestion)
    }

    if (data.suggestion.place_type[0] === 'address') {
      viewDetail(data.suggestion)
    }

    _blurInput()
  }

  function handleFocus(e: React.FocusEvent<any>) {
    getRecentSearches()
    if (inputProps.onFocus) inputProps.onFocus(e)
  }

  function viewDetail(place: TopHap.Place) {
    updateMode({ mode: 'Detail', id: place.id })
  }

  return (
    <Autosuggest
      inputProps={{
        autoComplete: 'off',
        id: 'th-geo-input',
        ...inputProps,
        onFocus: handleFocus
      }}
      theme={{
        container: cn('th-geo-autocomplete', className),
        suggestionsContainerOpen: 'th-suggestions-container-open',
        suggestionsList: 'th-suggestions-list',
        suggestion: 'th-suggestion',
        suggestionHighlighted: 'th-highlighted',
        sectionContainer: 'th-section-container',
        sectionTitle: 'th-section-title',
        input: 'th-geo-input'
      }}
      renderSuggestionsContainer={renderSuggestionsContainer}
      renderInputComponent={renderInputComponent}
      suggestions={memoizedSuggestions}
      onSuggestionsFetchRequested={handleSuggestionsFetchRequested}
      onSuggestionsClearRequested={handleSuggestionsClearRequested}
      getSuggestionValue={getSuggestionValue}
      renderSuggestion={renderSuggestion}
      onSuggestionSelected={handleSuggestionSelected}
      renderSectionTitle={renderSectionTitle}
      getSectionSuggestions={getSectionSuggestions}
      shouldRenderSuggestions={shouldRenderSuggestions}
      highlightFirstSuggestion
      multiSection
      // alwaysRenderSuggestions
    />
  )
}
