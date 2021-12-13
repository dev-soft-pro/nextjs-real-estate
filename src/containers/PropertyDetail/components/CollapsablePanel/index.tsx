import React from 'react'
import cn from 'classnames'
import SvgExpand from 'assets/images/icons/expand_more.svg'

import styles from './styles.scss?type=global'

interface CollapsablePanelProps {
  bodyClassName?: string
  children: React.ReactNode
  defaultExpanded?: boolean
  id?: string
  lazyload?: boolean
  title: string
  onExpand?: () => void
}

export default function CollapsablePanel({
  bodyClassName,
  children,
  defaultExpanded,
  id,
  lazyload,
  title,
  onExpand
}: CollapsablePanelProps) {
  const [expanded, setExpanded] = React.useState(defaultExpanded)
  const [loaded, setLoaded] = React.useState(!lazyload || defaultExpanded)
  React.useEffect(() => {
    if (!loaded && expanded) {
      setLoaded(true)
    }
  }, [loaded, expanded])

  function toggle() {
    setExpanded(!expanded)

    if (onExpand && !expanded) {
      onExpand()
    }
  }

  return (
    <section
      className={cn('th-collapsable-panel', { 'th-expanded': expanded })}
      id={id}
    >
      <h4 className='th-panel-header' onClick={toggle}>
        {title}
        <SvgExpand
          className={cn('th-expand-icon', { 'th-expanded': expanded })}
        />
      </h4>
      <div className={cn('th-panel-body', bodyClassName)}>
        {loaded && children}
      </div>

      <style jsx>{styles}</style>
    </section>
  )
}
