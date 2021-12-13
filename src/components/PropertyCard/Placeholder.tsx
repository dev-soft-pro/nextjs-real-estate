import React from 'react'

import styles from './styles.scss?type=global'

export default function Placeholder() {
  return (
    <div className='th-property-card th-property-card-placeholder'>
      <section className='th-main-section'>
        <div className='th-image-placeholder-container' />
      </section>

      <section className='th-info-section' />

      <style jsx>{styles}</style>
      <style jsx>{`
        .th-info-section {
          height: 127px;
        }
      `}</style>
    </div>
  )
}
