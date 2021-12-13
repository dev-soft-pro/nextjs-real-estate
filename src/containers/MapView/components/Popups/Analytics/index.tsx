import React from 'react'
import SvgHome from 'assets/images/metrics/home.svg'
import { AnalyticsLayer } from 'consts/data_mapping'

import styles from './styles.scss?type=global'

interface AnalyticsPopupProps {
  color: string
  count?: number
  data?: any
  meta: AnalyticsLayer
  metric: TopHap.AnalyticsMetric
  value: string
}

export default function Analytics({
  color,
  count,
  data,
  meta,
  metric,
  value
}: AnalyticsPopupProps) {
  return (
    <div className='th-analytics-popup'>
      {count !== undefined && (
        <div className='th-info'>
          <div className='th-icon'>
            <SvgHome />
          </div>
          <span className='th-label'># Properties:</span>
          <span className='th-value'>{count}</span>
        </div>
      )}
      <div className='th-info'>
        <div className='th-icon'>
          <div
            className='th-hexagon'
            style={{ backgroundColor: color, color: color }}
          />
        </div>
        <span className='th-label'>
          {!meta.valueType && 'Average '}
          {meta.title}:
        </span>
        <span className='th-value'>
          {metric === 'unique_zones'
            ? data
              ? data.map((e: any) => `${e.name} (${e.type})`).join(', ')
              : ''
            : value}
        </span>
      </div>

      <style jsx>{styles}</style>
    </div>
  )
}
