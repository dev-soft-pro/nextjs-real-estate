import React from 'react'
import { useRouter } from 'next/router'

import Button from 'components/Button'
import Checkbox from 'components/Checkbox'
import Popover from 'components/Popover'
import Tooltip from 'components/Tooltip'

import { logEvent } from 'services/analytics'

import imgTrigger from 'assets/images/map/boundaries.jpg'
import SvgLock from 'assets/images/icons/lock.svg'

import styles from './styles.scss?type=global'

interface BoundariesPanelProps {
  authenticated: boolean
  zones: TopHap.PreferencesState['map']['zones']
  setMapOption: TopHap.PreferencesCreators['setMapOption']
}

export default function BoundariesPanel({
  authenticated,
  zones,
  setMapOption
}: BoundariesPanelProps) {
  const [expanded, setExpanded] = React.useState(false)
  const refElement = React.useRef<HTMLDivElement>(null)
  const router = useRouter()

  function toggle() {
    setExpanded(!expanded)
    logEvent('map', 'boundaries', 'trigger', { expanded: !expanded })
  }

  function onChange(type: string, checked: boolean) {
    setMapOption('zones', { [type]: checked }, true)
  }

  function onClickOutside(e: any) {
    if (refElement.current && refElement.current.contains(e.target)) {
      return
    }

    setExpanded(false)
  }

  function goSignUp() {
    router.replace(router.pathname, {
      pathname: router.asPath,
      query: {
        auth: 'signup'
      }
    })

    logEvent('lock', 'lock_auth', 'boundaries_panel')
  }

  return (
    <div ref={refElement}>
      <Button
        className='th-boundaries-panel-trigger'
        onClick={authenticated ? toggle : goSignUp}
      >
        <Tooltip tooltip='Boundaries' trigger='hover' placement='left'>
          <img className='th-trigger-icon' src={imgTrigger} alt='Boundaries' />
          {!authenticated && <SvgLock className='th-lock-badge' />}
        </Tooltip>
      </Button>
      <Popover
        className='th-boundaries-panel'
        expanded={expanded}
        onClickOutside={onClickOutside}
      >
        <div className='th-panel-body'>
          <h3 className='th-panel-title'>Geo Boundaries</h3>
          <div className='th-divider' />
          <div className='th-boundary-options'>
            <Checkbox
              label='County'
              checked={zones.county}
              onChange={(_, checked) => onChange('county', checked)}
            />
            <Checkbox
              label='Zip'
              checked={zones.zip}
              onChange={(_, checked) => onChange('zip', checked)}
            />
            <Checkbox
              label='Place'
              checked={zones.place}
              onChange={(_, checked) => onChange('place', checked)}
            />
            <Checkbox
              label='School'
              checked={zones.school}
              onChange={(_, checked) => onChange('school', checked)}
            />
          </div>
        </div>
        <div className='th-triangle-down' />

        <style jsx>{styles}</style>
      </Popover>
    </div>
  )
}
