import React from 'react'
import cn from 'classnames'
import styles from './styles.scss?type=global'

interface Props {
  children: React.ReactNode
  className?: string
}

export default function AnalyticsLayerOptions({ children, className }: Props) {
  return (
    <div className={cn('th-analytics-layer-options', className)}>
      {children}
      <style jsx>{styles}</style>
    </div>
  )
}
