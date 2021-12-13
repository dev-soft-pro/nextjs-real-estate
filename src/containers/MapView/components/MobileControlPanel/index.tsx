import React from 'react'
import Button from 'components/Button'
import Popover from 'components/Popover'

import AnalyticsLayerPanel from '../AnalyticsLayerPanel'

import SvgMap from 'assets/images/map/map.svg'
import SvgLayers from 'assets/images/map/layers.svg'
import SvgAngleLeft from 'assets/images/map/angle-left.svg'
import { logEvent } from 'services/analytics'

import styles from './styles.scss?type=global'

interface MobileControlPanel {
  isSiderVisible: boolean
  updateSider: TopHap.UICreators['updateSider']
}

export default function MobileControlPanel({
  isSiderVisible,
  updateSider
}: MobileControlPanel) {
  const [expanded, setExpanded] = React.useState(false)
  const refElement = React.useRef<HTMLDivElement>(null)

  function toggle() {
    setExpanded(!expanded)
  }

  function collapse(event: any) {
    const appElement: Element = document.querySelector('.th-app') as Element

    if (
      (refElement.current && refElement.current.contains(event.target)) ||
      !appElement.contains(event.target)
    ) {
      return
    }

    setExpanded(false)
  }

  function onMapView() {
    logEvent('map', 'mobile_mapview')
    updateSider('visible', false)
  }

  function onListView() {
    logEvent('map', 'mobile_listview')
    updateSider('visible', true)
  }

  return (
    <div className='th-mobile-control-panel'>
      <section className='th-panel-section'>
        {isSiderVisible ? (
          <Button
            className='th-control-button th-mapview-button'
            onClick={onMapView}
          >
            <SvgMap />
            <span>Map View</span>
          </Button>
        ) : (
          <Button
            className='th-control-button th-listview-button'
            onClick={onListView}
          >
            <SvgAngleLeft />
            <span>List View</span>
          </Button>
        )}

        {!isSiderVisible && (
          <Button
            className='th-control-button th-layers-button'
            buttonRef={refElement}
            onClick={toggle}
          >
            <SvgLayers />
            <span>Insights</span>
          </Button>
        )}
      </section>
      <Popover
        className='th-overlay-panel'
        expanded={expanded}
        onClickOutside={collapse}
        anchor='bottom'
      >
        <div className='th-panel-body'>
          <AnalyticsLayerPanel />
        </div>
        <div className='th-triangle-down' />
      </Popover>

      <style jsx>{styles}</style>
    </div>
  )
}
