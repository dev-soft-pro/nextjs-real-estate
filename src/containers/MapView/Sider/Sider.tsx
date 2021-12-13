import React from 'react'
import cn from 'classnames'
import dynamic from 'next/dynamic'
import Button from 'components/Button'
import { WIDE_VIEWPORT_WIDTH } from 'consts'

import styles from './styles.scss?type=global'

const Properties = dynamic(() => import('./Properties'))
const Statistics = dynamic(() => import('./Statistics'))

interface SiderProps {
  mode: TopHap.UIState['siderMode']
  sider: TopHap.UIState['sider']
  viewportWidth: TopHap.UIState['viewport']['width']
  updateSider: TopHap.UICreators['updateSider']
}

export default function Sider({
  mode,
  sider,
  viewportWidth,
  updateSider
}: SiderProps) {
  React.useEffect(() => {
    document.body.classList.toggle('th-sider-showed', sider.visible)
  }, [sider.visible])

  React.useEffect(() => {
    if (viewportWidth <= WIDE_VIEWPORT_WIDTH && sider.size === 'Wide') {
      updateSider('size', 'Normal')
    } else if (viewportWidth > WIDE_VIEWPORT_WIDTH && sider.size === 'Normal') {
      updateSider('size', 'Wide')
    }
  }, [viewportWidth])

  function toggle() {
    updateSider('visible', !sider.visible)
  }

  return (
    <aside
      className={cn(
        'th-sider',
        { 'th-wide': sider.size === 'Wide' },
        { 'th-hide': !sider.visible }
      )}
    >
      <Button className='th-toggler' onClick={toggle}>
        <span className={sider.visible ? 'th-arrow-left' : 'th-arrow-right'} />
      </Button>
      {mode === 'list' ? <Properties /> : <Statistics />}

      <style jsx>{styles}</style>
    </aside>
  )
}
