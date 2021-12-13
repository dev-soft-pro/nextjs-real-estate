import React from 'react'
import Agent from '../Agent'
import styles from './styles.scss?type=global'

interface MobileCardProps {
  property: TopHap.Property
  viewSelectors: React.ReactElement
  views: React.ReactElement
}

export default function MobileCard({
  property,
  viewSelectors,
  views
}: MobileCardProps) {
  return (
    <div className='th-mobile-card'>
      <Agent property={property} />

      <section className='th-main-section'>
        <div className='th-view-container'>{views}</div>
      </section>

      {viewSelectors}

      <section
        id='description'
        className='th-description'
        style={{ height: '100%' }}
      >
        {property.PublicRemarks}
      </section>

      <style jsx>{styles}</style>
    </div>
  )
}
