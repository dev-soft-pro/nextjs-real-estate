import React from 'react'
import Button, { ButtonProps } from 'components/Button'
import PopOver from 'components/Popover'
import Tooltip from 'components/Tooltip'
import { logEvent } from 'services/analytics'

import imgTrigger from 'assets/images/mapstyle/trigger.jpg'
import imgSatellite from 'assets/images/mapstyle/satellite.jpg'
import imgDark from 'assets/images/mapstyle/dark.jpg'
import imgLight from 'assets/images/mapstyle/light.jpg'
import imgColor from 'assets/images/mapstyle/color.jpg'
import imgAuto from 'assets/images/mapstyle/auto.jpg'

import styles from './styles.scss?type=global'

interface MapStyleButtonProps {
  icon: string
  label: string
  onClick: ButtonProps['onClick']
}

interface MapStylePanelProps {
  setMapOption: TopHap.PreferencesCreators['setMapOption']
}

function MapStyleButton({ icon, label, ...props }: MapStyleButtonProps) {
  return (
    <Button className='th-mapstyle-button' {...props}>
      <img src={icon} alt='' />
      <span>{label}</span>
    </Button>
  )
}

export default function MapStylePanel({ setMapOption }: MapStylePanelProps) {
  const [expanded, setExpanded] = React.useState(false)
  const refElement = React.useRef<HTMLDivElement>(null)

  function toggle() {
    setExpanded(!expanded)
    logEvent('map', 'style', 'trigger', { expanded: !expanded })
  }

  function onSelect(type: TopHap.MapType) {
    setExpanded(false)

    setMapOption('mapType', type)
    logEvent('map', 'style', 'change', { type })
  }

  function onClickOutside(e: any) {
    if (refElement.current && refElement.current.contains(e.target)) {
      return
    }

    setExpanded(false)
  }

  return (
    <div ref={refElement}>
      <Button className='th-mapstyle-panel-trigger' onClick={toggle}>
        <Tooltip tooltip={'Map Styles'} trigger='hover' placement='left'>
          <img className='th-trigger-icon' src={imgTrigger} alt='' />
        </Tooltip>
      </Button>
      <PopOver
        className='th-mapstyle-panel'
        anchor='bottom'
        expanded={expanded}
        onClickOutside={onClickOutside}
      >
        <div className='th-mapstyle-panel-content'>
          <MapStyleButton
            icon={imgAuto}
            label='Auto'
            onClick={() => onSelect('auto')}
          />
          <MapStyleButton
            icon={imgLight}
            label='Terrain'
            onClick={() => onSelect('light')}
          />
          <MapStyleButton
            icon={imgColor}
            label='Color'
            onClick={() => onSelect('color')}
          />
          <MapStyleButton
            icon={imgDark}
            label='Dark'
            onClick={() => onSelect('dark')}
          />
          <MapStyleButton
            icon={imgSatellite}
            label='Satellite'
            onClick={() => onSelect('satellite')}
          />
        </div>
        <div className='th-triangle-down' />
      </PopOver>

      <style jsx>{styles}</style>
    </div>
  )
}
