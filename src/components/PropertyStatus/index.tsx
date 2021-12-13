import React from 'react'
import cn from 'classnames'
import dayjs from 'dayjs'
import TimeAgo from 'javascript-time-ago'
import en from 'javascript-time-ago/locale/en'
import { propertyStatus } from 'consts/data_mapping'
import { status } from 'utils/properties'
import styles from './styles.scss?type=global'

TimeAgo.addLocale(en)
const timeAgo = new TimeAgo('en-US')

interface PropertyStatusProps {
  className?: string
  property: TopHap.Property
}

export default function PropertyStatus({
  className,
  property
}: PropertyStatusProps) {
  const date =
    property.TophapStatus === 'Active' || property.TophapStatus === 'New'
      ? property.ListDate
      : property.TophapStatusChangeTimestamp

  const isInMonth = dayjs()
    .subtract(1, 'month')
    .isAfter(dayjs(date))

  return (
    <div className={cn('th-status', className)}>
      <div
        className='th-status-label'
        style={{ background: propertyStatus[property.TophapStatus].color }}
      >
        {status(property)}
      </div>
      {date ? (
        <div className='th-updated'>
          {isInMonth
            ? dayjs(date).format('MM/DD/YYYY')
            : timeAgo.format(new Date(date))}
        </div>
      ) : null}

      <style jsx>{styles}</style>
    </div>
  )
}
