import React from 'react'
import cn from 'classnames'

import Button from 'components/Button'

export type Period = 'annual' | 'month'
interface PeriodPickerProps {
  period: Period
  onChange(interval: Period): void
}

export default function PeriodPicker({ period, onChange }: PeriodPickerProps) {
  return (
    <div className='th-period-picker'>
      <Button
        className={cn('th-period', { 'th-selected': period === 'annual' })}
        onClick={() => onChange('annual')}
      >
        Yearly SAVE 18%
      </Button>
      &nbsp;|&nbsp;
      <Button
        className={cn('th-period', { 'th-selected': period === 'month' })}
        onClick={() => onChange('month')}
      >
        Monthly
      </Button>
    </div>
  )
}
