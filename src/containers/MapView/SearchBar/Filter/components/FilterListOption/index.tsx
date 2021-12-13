import React from 'react'
import cn from 'classnames'
import Button from 'components/Button'
import FilterOption, { FilterOptionProps } from '../FilterOption'
import styles from './styles.scss?type=global'

interface Props
  extends Omit<FilterOptionProps, 'active' | 'align' | 'clearable'> {
  children: React.ReactElement[]
  noHeader?: boolean
  onClearAll?: () => void
}

export default function FilterListOption({
  children,
  className,
  containerClassName,
  noHeader,
  onClearAll,
  ...filterOptionProps
}: Props) {
  function handleClose() {
    if (filterOptionProps.triggerRef && filterOptionProps.triggerRef.current) {
      filterOptionProps.triggerRef.current.click()
    }
  }

  return (
    <FilterOption
      active={children.reduce(
        (a: boolean, c: any) => a || c.props.active,
        false
      )}
      align='right'
      clearable={false}
      className={cn('th-filter-list-option', className)}
      containerClassName={cn('th-option-content', containerClassName)}
      {...filterOptionProps}
    >
      {!noHeader && (
        <div className='th-more-header'>
          <span className='th-header-title'>Filters</span>
          {onClearAll && (
            <Button className='th-clear-all-button' onClick={onClearAll}>
              Clear All Filters
            </Button>
          )}
          <Button className='th-close-button' onClick={handleClose}>
            Close
          </Button>
        </div>
      )}
      <div className='th-options'>{children}</div>

      <style jsx>{styles}</style>
    </FilterOption>
  )
}
