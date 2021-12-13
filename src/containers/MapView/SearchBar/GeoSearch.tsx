import React from 'react'
import GeoAutocomplete from 'components/GeoAutocomplete/advanced'
import { searchAddresses } from 'services/geo'

interface GeoSearchProps {
  asyncStatus: TopHap.GlobalState['status']
  keyword: string
  place?: TopHap.Place
  onSearch(keyword: string, place?: TopHap.Place): void
}

export default function GeoSearch({
  asyncStatus,
  place,
  onSearch: updatePlace,
  ...props
}: GeoSearchProps) {
  const [keyword, setKeyword] = React.useState(props.keyword)
  const [suggestion, setSuggestion] = React.useState(place)
  const loading = React.useMemo(
    () =>
      Object.keys(asyncStatus).filter(
        e => asyncStatus[e] === 'request' && e.startsWith('properties/')
      ).length !== 0,
    [asyncStatus]
  )

  React.useEffect(() => {
    if (props.keyword !== keyword) {
      setKeyword(props.keyword)
      if (props.keyword) {
        searchAddresses({ input: props.keyword })
          .then(res => {
            const suggestion = res.suggests[0]
            if (suggestion) {
              setSuggestion(suggestion)
              updatePlace(suggestion.place_name, suggestion)
            }
          })
          .catch(e => console.log(e))
      } else {
        onClear()
      }
    }
  }, [props.keyword])

  function onChange(event: any, { newValue }: any) {
    setKeyword(newValue)
    if (!newValue) {
      setSuggestion(undefined)
    }
  }

  function onClear() {
    setKeyword('')
    setSuggestion(undefined)
    updatePlace('', undefined)
  }

  function onSearch() {
    if (suggestion) {
      setKeyword(suggestion.place_name)
      updatePlace(suggestion.place_name, suggestion)
    } else {
      updatePlace(keyword, suggestion)
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

  return (
    <GeoAutocomplete
      placeholder='Address, Neighborhood, City'
      loading={loading}
      value={keyword}
      onChange={onChange}
      onClear={onClear}
      onSearch={onSearch}
      onSuggestionSelected={onSuggestionSelected}
      onSuggestions={onSuggestions}
    />
  )
}
