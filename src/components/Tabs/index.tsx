import React from 'react'
import cn from 'classnames'
import MaterialTabs, { TabsProps } from '@material-ui/core/Tabs'
import MaterialTab, { TabProps } from '@material-ui/core/Tab'

import styles from './styles.scss?type=global'

export default function Tabs({
  value,
  children,
  className,
  onChange
}: TabsProps) {
  return (
    <MaterialTabs
      variant='scrollable'
      scrollButtons='auto'
      value={value}
      onChange={onChange}
      classes={{
        root: cn('th-tabs', className),
        indicator: 'th-tabs-indicator'
      }}
    >
      {children}
      <style jsx>{styles}</style>
    </MaterialTabs>
  )
}

Tabs.Tab = function(props: TabProps) {
  return (
    <MaterialTab
      classes={{
        root: 'th-tab',
        selected: 'th-tab-selected',
        wrapper: 'th-tab-content'
      }}
      {...props}
    />
  )
}
