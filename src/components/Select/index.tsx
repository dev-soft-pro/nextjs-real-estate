import React from 'react'
import Select, { SelectProps } from '@material-ui/core/Select'
import MenuItem from '@material-ui/core/MenuItem'
import cn from 'classnames'

import styles from './styles.scss?type=global'

export default function THSelect({
  children,
  value,
  label,
  onChange,
  className,
  ...props
}: SelectProps) {
  return (
    <div className={cn('th-input-container', className)}>
      {label ? <label className='th-input-label'>{label}</label> : null}
      <Select
        className={cn('th-select', className)}
        value={value}
        onChange={onChange}
        disableUnderline
        classes={{
          selectMenu: 'th-select-input'
        }}
        {...props}
      >
        {children}
      </Select>
      <style jsx>{styles}</style>
    </div>
  )
}

interface MenuItemProps {
  className?: string
  value: any
  [eleName: string]: any
}

export class Option extends React.Component<MenuItemProps> {
  render() {
    const { children, className, ...props } = this.props
    return (
      <MenuItem className={cn('th-select-option', className)} {...props}>
        {children}
        <style jsx>{styles}</style>
      </MenuItem>
    )
  }
}
