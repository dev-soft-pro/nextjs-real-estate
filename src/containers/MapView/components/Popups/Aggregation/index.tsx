import React from 'react'
import SvgHome from 'assets/images/metrics/home.svg'

import styles from './styles.scss?type=global'

interface AggregationPopupProps {
  color: string
  colorAverage: string
  colorMetric: TopHap.PropertyMetric
  count: number
  radiusAverage: string
  radiusMetric: TopHap.PropertyMetric
  [extraProps: string]: any
}

export default function AggregationPopup({
  count,
  colorMetric,
  colorAverage,
  color,
  radiusMetric,
  radiusAverage
}: AggregationPopupProps) {
  return (
    <div className='th-aggregation-popup'>
      <div className='th-info'>
        <div className='th-icon'>
          <SvgHome />
        </div>
        <span className='th-label'># Properties:</span>
        <span className='th-value'>{count}</span>
      </div>
      <div className='th-info'>
        <div className='th-icon'>
          <div className='th-circle' style={{ background: color }} />
        </div>
        <span className='th-label'>Average {colorMetric}:</span>
        <span className='th-value'>{colorAverage}</span>
      </div>

      <div className='th-info'>
        <div className='th-icon'>
          <div className='th-circle th-radius' style={{ borderColor: color }} />
        </div>
        <span className='th-label'>Average {radiusMetric}:</span>
        <span className='th-value'>{radiusAverage}</span>
      </div>

      <style jsx>{styles}</style>
    </div>
  )
}
