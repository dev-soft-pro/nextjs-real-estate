import React from 'react'
import FormControlLabel from '@material-ui/core/FormControlLabel'
import Checkbox from '@material-ui/core/Checkbox'
import cn from 'classnames'

import styles from './styles.scss?type=global'

interface CheckboxProps {
  label: React.ReactNode
  value?: unknown
  className?: string
  checked: boolean
  onChange?(e: React.ChangeEvent<HTMLInputElement>, checked: boolean): void
  style?: React.CSSProperties
  [eleName: string]: any
}

export default function THCheckbox({
  label,
  value,
  className,
  checked,
  onChange,
  style,
  ...props
}: CheckboxProps) {
  return (
    <>
      <FormControlLabel
        className={cn('th-checkbox', className)}
        style={style}
        checked={checked}
        classes={{
          label: 'th-checkbox-label',
          disabled: 'th-disabled'
        }}
        control={
          <Checkbox
            value={value}
            onChange={onChange}
            color='primary'
            className='th-check'
          />
        }
        label={label}
        {...props}
      />
      <style jsx>{styles}</style>
    </>
  )
}
