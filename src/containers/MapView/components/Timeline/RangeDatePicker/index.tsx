import React, { useMemo } from 'react'
import DayPicker from 'react-day-picker'
import dayjs from 'dayjs'
import 'react-day-picker/lib/style.css'

import Popover from 'components/Popover'

import styles from './styles.scss'

interface RangeDatePickerProps {
  anchor: string
  day: string
  minDate: string
  maxDate: string
  startPos: number
  visible: boolean
  updateDay: (date: Date) => void
  updateVisible: (visible: boolean) => void
}

export default function RangeDatePicker({
  anchor,
  day,
  minDate,
  maxDate,
  startPos,
  visible,
  updateDay,
  updateVisible
}: RangeDatePickerProps) {
  const initDate = useMemo(() => dayjs(day, 'MM/DD/YY').toDate(), [day])

  const modifier = useMemo(() => {
    return {
      before: dayjs(minDate, 'MM/DD/YY').toDate(),
      after: dayjs(maxDate, 'MM/DD/YY').toDate()
    }
  }, [minDate, maxDate])

  function onSelectDay(day: Date) {
    updateVisible(false)
    updateDay(day)
  }

  return (
    <div
      className='th-timeline-datepicker-container'
      style={{ left: startPos }}
    >
      <Popover
        expanded={visible}
        anchor={anchor}
        onClickOutside={() => updateVisible(false)}
      >
        <div className='th-timeline-datepicker-wrapper'>
          <DayPicker
            disabledDays={modifier}
            month={initDate}
            selectedDays={initDate}
            onDayClick={onSelectDay}
          />
        </div>
      </Popover>
      <style jsx>{styles}</style>
    </div>
  )
}
