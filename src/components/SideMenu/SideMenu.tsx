import React from 'react'
import { ReactReduxContext } from 'react-redux'
import cn from 'classnames'
import { useRouter } from 'next/router'

import SvgSignUp from 'assets/images/icons/arrow_downward.svg'
import SvgSignIn from 'assets/images/icons/arrow_forward.svg'
import SvgCompare from 'assets/images/icons/compare.svg'
import SvgHelp from 'assets/images/icons/help.svg'
import SvgProperty from 'assets/images/icons/property.svg'
import SvgTrends from 'assets/images/icons/trends.svg'
import SvgLogo from 'assets/images/logos/logo-hexa.svg'
import SvgMap from 'assets/images/icons/map.svg'
import SvgRent from 'assets/images/icons/rent.svg'
import Avatar from 'components/Avatar'
import Button from 'components/Button'
import AccountMenu from 'components/Header/Menu/AccountMenu'
import HelpMenu from 'components/Header/Menu/HelpMenu'
import Link, { NavLink } from 'components/Link'
import Overlay from 'components/Overlay'

import { BREAK_SM } from 'consts'
import { MAP_PAGE, PRICING_PAGE } from 'consts/url'
import { logEvent } from 'services/analytics'
import { state2MapUrl } from 'utils/url'
import { setIn } from 'utils/object'

import styles from './styles.scss?type=global'

type ActionProps = {
  disableHideOnClick?: boolean
  icon: React.ReactNode
  selected?: boolean
  title?: React.ReactNode
  onClick?: (ev: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void
}

export function Action({ icon, selected, title, onClick }: ActionProps) {
  return (
    <Button
      className={cn('th-action', { 'th-selected': selected })}
      onClick={onClick}
    >
      <span className='th-icon-wrapper'>{icon}</span>
      {title && <span className='th-title-wrapper'>{title}</span>}
      <style jsx>{styles}</style>
    </Button>
  )
}

interface SideMenuProps {
  className?: string
  expanded: boolean
  properties: TopHap.MapPreferences['properties']
  rental: boolean
  sider: TopHap.UIState['sider']
  siderMode: TopHap.UIState['siderMode']
  user: TopHap.UserState['info']
  viewportWidth: number
  updateUI: TopHap.UICreators['updateStates']
}

export default function SideMenu({
  className,
  expanded,
  properties,
  rental,
  sider,
  siderMode,
  user,
  viewportWidth,
  updateUI
}: SideMenuProps) {
  const context = React.useContext(ReactReduxContext)
  const router = useRouter()
  const refContainer = React.useRef<HTMLElement>(null)

  function hideMenu() {
    if (viewportWidth > BREAK_SM) return
    updateUI({ isSideMenuExpanded: false })
  }

  function onListings(isRental: boolean) {
    const store: TopHap.StoreState = context.store.getState()
    let newStore = setIn(store, 'preferences.map.properties.enabled', true)
    newStore = setIn(newStore, 'ui.siderMode', 'list')
    newStore = setIn(newStore, 'ui.sider.visible', true)
    newStore = setIn(newStore, 'preferences.filter.rental', isRental)

    router.push(MAP_PAGE, state2MapUrl(newStore))

    logEvent('side_menu', 'change_mode', null, { mode: 'listings' })
  }

  function onMap() {
    // show only map without sider. disable properties and trends
    // properties.enabled becomes false, sider and trends will be off from map subscribers
    const store: TopHap.StoreState = context.store.getState()
    const newStore = setIn(store, 'preferences.map.properties.enabled', false)

    router.push(MAP_PAGE, state2MapUrl(newStore))

    logEvent('side_menu', 'change_mode', null, { mode: 'map' })
  }

  function onTrends() {
    // when sider becomes visible, properties.enabled becomes true from map subscribers
    const store: TopHap.StoreState = context.store.getState()
    let newStore = setIn(store, 'ui.siderMode', 'statistics')
    newStore = setIn(newStore, 'ui.sider.visible', true)

    router.push(MAP_PAGE, state2MapUrl(newStore))

    logEvent('side_menu', 'change_mode', null, { mode: 'insights' })
  }

  function onCompare() {
    logEvent('side_menu', 'change_mode', null, { mode: 'compare' })
  }

  function Action({
    disableHideOnClick,
    icon,
    selected,
    title,
    onClick
  }: ActionProps) {
    function handleClick(ev: React.MouseEvent<HTMLButtonElement, MouseEvent>) {
      if (!disableHideOnClick) hideMenu()
      if (onClick) onClick(ev)
    }

    return (
      <Button
        className={cn('th-action', { 'th-selected': selected })}
        onClick={handleClick}
      >
        <span className='th-icon-wrapper'>{icon}</span>
        {title && <span className='th-title-wrapper'>{title}</span>}
        <style jsx>{styles}</style>
      </Button>
    )
  }

  const isMapPage = router.pathname === '/map' || router.pathname === MAP_PAGE
  const isProperty = properties.enabled && siderMode === 'list'

  return (
    <>
      <aside
        className={cn('th-side-menu', className, { 'th-expanded': expanded })}
        ref={refContainer}
      >
        <Link href='/' className='th-logo'>
          <SvgLogo />
        </Link>

        <section className='th-custom-actions'>
          <Action
            icon={<SvgProperty />}
            title='Listings'
            selected={isMapPage && isProperty && !rental}
            onClick={() => onListings(false)}
          />
          <Action
            icon={<SvgRent />}
            title='Rentals'
            selected={isMapPage && isProperty && rental}
            onClick={() => onListings(true)}
          />
          <Action
            icon={<SvgMap />}
            title='Map'
            selected={isMapPage && !properties.enabled && !sider.visible}
            onClick={onMap}
          />
          <Action
            icon={<SvgTrends />}
            title='Insights'
            selected={
              isMapPage && properties.enabled && siderMode === 'statistics'
            }
            onClick={onTrends}
          />
          <NavLink
            className='th-link-action'
            activeClassName='th-active'
            href='/compare'
          >
            <Action icon={<SvgCompare />} title='Compare' onClick={onCompare} />
          </NavLink>
        </section>

        <section className='th-global-actions'>
          <HelpMenu
            eventCategory='side_menu'
            title={
              <Action disableHideOnClick icon={<SvgHelp />} title='Help' />
            }
          />
          {user.isAnonymous === false ? (
            <AccountMenu
              eventCategory='side_menu'
              title={
                <Action
                  disableHideOnClick
                  icon={
                    <Avatar
                      className='th-avatar'
                      name={user.displayName}
                      src={user.photoUrl}
                    />
                  }
                  title={viewportWidth <= BREAK_SM ? 'Account' : ''}
                />
              }
            />
          ) : (
            <div className='th-auth-actions'>
              <Link
                className='th-link-action'
                href={router.pathname}
                as={{ query: { auth: 'signin' } }}
              >
                <Action
                  icon={<SvgSignIn />}
                  title='Sign In'
                  onClick={() => logEvent('side_menu', 'login', 'click')}
                />
              </Link>
              <Link
                className='th-link-action'
                href={router.pathname}
                as={{ query: { auth: 'signin' } }}
              >
                <Action
                  icon={<SvgSignUp />}
                  title='Sign Up'
                  onClick={() => logEvent('side_menu', 'sign_up', 'click')}
                />
              </Link>
            </div>
          )}
          <Link className='th-link-action' href={PRICING_PAGE}>
            <Button className='th-upgrade-button' onClick={hideMenu}>
              Upgrade
            </Button>
          </Link>
        </section>
        <style jsx>{styles}</style>
      </aside>
      {expanded && viewportWidth <= BREAK_SM && (
        <Overlay
          containerProps={{
            style: { zIndex: 99 },
            onClick: hideMenu
          }}
        />
      )}
    </>
  )
}
