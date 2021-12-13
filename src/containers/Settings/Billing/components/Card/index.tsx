import React from 'react'
import cn from 'classnames'
import Button from 'components/Button'
import OverlaySpinner from 'components/OverlaySpinner'

import styles from './styles.scss?type=global'

interface CardProps {
  source: any
  loading: boolean
  onChange(): void
  // onRemove(): void
}

export default function Card({
  source,
  loading,
  onChange
}: // onRemove
CardProps) {
  if (!source.id) return null
  return (
    <div className='th-card'>
      <div className='th-card-info'>
        <span
          className={cn(
            'th-card-brand',
            source.brand && `th-card-brand-${source.brand.toLowerCase()}`
          )}
        />
        <span className='th-card-last4'>•••• {source.last4}</span>
        <span className='th-card-exp'>
          {source.exp_month}/{source.exp_year}
        </span>
      </div>
      <div className='th-actions'>
        <Button className='th-action-button' onClick={onChange}>
          Change
        </Button>
        {/* <Button
          className='th-action-button th-cancel-button'
          onClick={onRemove}
        >
          Remove
        </Button> */}
      </div>
      <OverlaySpinner type='circle' absolute size={21} visible={loading} />

      <style jsx>{styles}</style>
    </div>
  )
}
