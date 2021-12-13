import React from 'react'
import Autocomplete from '@material-ui/lab/Autocomplete'
import TextField from '@material-ui/core/TextField'

import styles from './styles.scss?type=global'

export default function SearchableSelect ({ options, ...props }) {
  const classes = {
    root: 'th-searchable-select',
    focused: 'th-focused',
    inputRoot: 'th-select-input-root',
    input: 'th-select-input',
    option: 'th-select-option',
    popper: 'th-searchable-select-popper'
  }

  return (
    <>
      <Autocomplete
        autoSelect
        classes={classes}
        options={options}
        getOptionLabel={option => option.title}
        closeIcon={null}
        renderInput={params => (
          <TextField {...params} variant='outlined' fullWidth />
        )}
        {...props}
      />
      <style jsx>{styles}</style>
    </>  
  )
}
