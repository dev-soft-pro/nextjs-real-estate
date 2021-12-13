import React from 'react'
import cn from 'classnames'

import Button from 'components/Button'
import Popover from 'components/Popover'
import Tooltip from 'components/Tooltip'

import SvgExpand from 'assets/images/icons/expand_more.svg'
import SvgEye from 'assets/images/icons/eye.svg'
import SvgEyeOff from 'assets/images/icons/eye_off.svg'

import styles from './styles.scss?type=global'

export interface FilterOptionProps {
  active: boolean
  align: 'left' | 'right'
  children?: React.ReactNode
  className?: string
  clearable: boolean
  collapseOnClickoutside?: boolean
  containerClassName?: string
  title: string
  tooltip?: React.ReactNode
  triggerRef?: React.RefObject<HTMLDivElement>
  value?: React.ReactNode
  onClear?(): void
  onToggle?(expanded: boolean): void
}

export default function FilterOption({
  active,
  align,
  children,
  className,
  clearable,
  collapseOnClickoutside,
  containerClassName,
  title,
  tooltip,
  triggerRef,
  value,
  onToggle,
  ...props
}: FilterOptionProps) {
  const [expanded, setExpanded] = React.useState(false)
  const refElement = React.useRef<HTMLDivElement>(null)

  function toggle() {
    setExpanded(!expanded)
    if (onToggle) onToggle(!expanded)
  }

  function onScroll(e: React.UIEvent<HTMLDivElement>) {
    e.stopPropagation()
  }

  function onClear(e: React.MouseEvent) {
    e.stopPropagation()
    if (props.onClear) props.onClear()
  }

  function onClickOutside(e: any) {
    const appElement = document.querySelector('.th-app') as Element
    if (
      (refElement.current && refElement.current.contains(e.target as Node)) ||
      !appElement.contains(e.target)
    ) {
      return
    }
    setExpanded(false)
    if (onToggle) onToggle(false)
  }

  return (
    <div
      className={cn(
        'th-filter-option',
        { 'th-expanded': expanded },
        { 'th-align-right': align === 'right' },
        { 'th-active': active },
        className
      )}
      ref={refElement}
      onScroll={onScroll}
    >
      <Tooltip tooltip={tooltip} trigger='hover' wrap={false}>
        <div className='th-option' onClick={toggle} ref={triggerRef}>
          <div className={cn('th-option-status', { 'th-active': active })}>
            {active ? <SvgEye /> : <SvgEyeOff />}
          </div>
          <div className='th-content'>
            <div className='th-title'>{title}</div>
            <div className='th-selected-value'>{value}</div>
          </div>
          <div className='th-option-actions'>
            {clearable && active && (
              <Button className='th-clear-button' onClick={onClear}>
                Clear
              </Button>
            )}
            <SvgExpand
              className={cn('th-expand-icon', { 'th-rotated': expanded })}
            />
          </div>
        </div>
      </Tooltip>
      <Popover
        className={containerClassName}
        expanded={expanded}
        onClickOutside={collapseOnClickoutside ? onClickOutside : undefined}
      >
        {children}
      </Popover>

      <style jsx>{styles}</style>
    </div>
  )
}

FilterOption.defaultProps = {
  active: false,
  align: 'left',
  clearable: true,
  collapseOnClickoutside: true
}
