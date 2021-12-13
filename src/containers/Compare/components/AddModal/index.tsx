import { useEffect, useState } from 'react'

import GeoAutocomplete from 'components/GeoAutocomplete/advanced'
import Modal from 'components/Modal'

import SvgAdd from 'assets/images/icons/add.svg'
import styles from './styles.scss?type=global'

interface AddModalProps {
  visible: boolean
  onAdd(place: TopHap.Place): void
  onClose?(): void
}

export default function AddModal({ visible, onAdd, onClose }: AddModalProps) {
  const [keyword, setKeyword] = useState('')
  const [suggestion, setSuggestion] = useState<TopHap.Place | undefined>(
    undefined
  )

  useEffect(() => {
    onClear()
  }, [visible])

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
    <Modal
      className='th-add-modal'
      closeButton={false}
      visible={visible}
      onClose={onClose}
    >
      <GeoAutocomplete
        placeholder='Address, Neighborhood, City or ZIP'
        value={keyword}
        excludeStreets
        inputProps={{
          autoFocus: true
        }}
        Icon={SvgAdd}
        onChange={onChange}
        onClear={onClear}
        onSearch={onSearch}
        onSuggestionSelected={onSuggestionSelected}
        onSuggestions={onSuggestions}
      />

      <style jsx>{styles}</style>
    </Modal>
  )
}
