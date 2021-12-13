import React from 'react'

import styles from './styles.scss'

const FEETS_PER_METER = 3.28084

interface ElevationPopupProps {
  alt: number
}

export default function Elevation({ alt }: ElevationPopupProps) {
  return (
    <div className='th-elevation-popup'>
      <div className='th-info'>
        <span className='th-label'>Alt: </span>
        <span className='th-value'>
          {(alt * FEETS_PER_METER).toFixed(2)} ft
        </span>
      </div>

      <style jsx>{styles}</style>
    </div>
  )
}
