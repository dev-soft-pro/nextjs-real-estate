import React from 'react'
import cn from 'classnames'
import styles from './styles.scss?type=global'

interface BreadcrumbProps {
  className?: string
  children: React.ReactNode
}

export default function Breadcrumb({ className, children }: BreadcrumbProps) {
  return (
    <div className={cn('th-breadcrumb', className)}>
      {children}
      <style jsx>{styles}</style>
    </div>
  )
}

Breadcrumb.Item = function({ className, children }: BreadcrumbProps) {
  return (
    <span className={cn('th-breadcrumb-item', className)}>
      {children}
      <style jsx>{styles}</style>
    </span>
  )
}
