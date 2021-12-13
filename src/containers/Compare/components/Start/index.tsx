import React from 'react'
import 'lazysizes'

import GeoAutocomplete from 'components/GeoAutocomplete/advanced'
import IntroVideo from 'components/IntroVideo'
import OverlaySpinner from 'components/OverlaySpinner'
import SvgAdd from 'assets/images/icons/add.svg'
import styles from './styles.scss?type=global'

export default function Start({
  loading,
  onAdd
}: {
  loading: boolean
  onAdd: (place: TopHap.Place) => void
}) {
  const [keyword, setKeyword] = React.useState('')
  const [suggestion, setSuggestion] = React.useState<TopHap.Place | undefined>(
    undefined
  )

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

  return (
    <div className='th-compare-start container'>
      <h1 className='th-page-title'>
        Compare Real Estate Markets and Properties
      </h1>
      <p className='th-page-description'>
        Using this tool you can compare property prices and it&apos;s indicators
        like TopHap estimated value price, price per square feet and other
        important indicators.
      </p>

      <GeoAutocomplete
        placeholder='Address, Neighborhood, City or ZIP'
        value={keyword}
        excludeStreets
        Icon={SvgAdd}
        onChange={onChange}
        onClear={onClear}
        onSearch={onSearch}
        onSuggestionSelected={onSuggestionSelected}
        onSuggestions={onSuggestions}
      />

      <hr />

      <div className='th-intro-video-container'>
        <IntroVideo eventCategory='compare' />
      </div>

      <OverlaySpinner visible={loading} />
      <style jsx>{styles}</style>
    </div>
  )
}
