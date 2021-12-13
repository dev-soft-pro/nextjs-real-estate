import React from 'react'
import Radio from '@material-ui/core/Radio'
import RadioGroup from '@material-ui/core/RadioGroup'
import FormControlLabel from '@material-ui/core/FormControlLabel'

import styles from './styles.scss?type=global'

interface RadioProps {
  className?: string
  label: React.ReactNode
  name?: string
  onChange?: (event: React.ChangeEvent<{}>, checked: boolean) => void
  labelPlacement?: 'end' | 'start' | 'top' | 'bottom'
  value?: unknown
  checked?: boolean
}

export default function TSRadio({ ...props }: RadioProps) {
  return (
    <>
      <FormControlLabel
        classes={{
          root: 'th-radio-wrapper',
          label: 'th-radio-label'
        }}
        control={
          <Radio classes={{ root: 'th-radio', checked: 'th-radio-checked' }} />
        }
        {...props}
      />
      <style jsx>{styles}</style>
    </>
  )
}

export { RadioGroup }
