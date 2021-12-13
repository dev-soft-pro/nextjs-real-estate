import React, { useContext } from 'react'
import { ReactReduxContext } from 'react-redux'
import cn from 'classnames'
import Router from 'next/router'

import SvgArrow from 'assets/images/icons/angle-left.svg'
import SvgHelp from 'assets/images/icons/help.svg'
import SvgLogo from 'assets/images/logos/logo-beta.svg'

import Avatar from 'components/Avatar'
import Button from 'components/Button'
import AccountMenu from 'components/Header/Menu/AccountMenu'
import HelpMenu from 'components/Header/Menu/HelpMenu'
import Link from 'components/Link'
import { MAP_PAGE } from 'consts/url'
import { logEvent } from 'services/analytics'
import styles from './styles.scss?type=global'

interface AppHeaderProps {
  customerOptions: TopHap.GlobalState['customerOptions']
  isSideMenuExpanded: boolean
  user: TopHap.UserState['info']
  updateUI: TopHap.UICreators['updateStates']
  updateSider: TopHap.UICreators['updateSider']
}

export default function AppHeader({
  customerOptions,
  isSideMenuExpanded,
  user,
  updateUI,
  updateSider
}: AppHeaderProps) {
  const context = useContext(ReactReduxContext)

  function toggleSideMenu() {
    updateUI({ isSideMenuExpanded: !isSideMenuExpanded })

    logEvent('app_header', 'side_menu', null, { expanded: !isSideMenuExpanded })
  }

  function onBack() {
    const store: TopHap.StoreState = context.store.getState()
    const isMapPage = Router.pathname === '/map' || Router.pathname === MAP_PAGE
    if (isMapPage && store.ui.sider.visible) {
      if (
        store.ui.siderMode === 'list' &&
        store.ui.sider.properties.mode === 'Detail'
      ) {
        updateSider('properties', { mode: 'List' }, true)
      } else {
        updateSider('visible', false)
      }
    } else {
      Router.back()
    }

    logEvent('app_header', 'back')
  }

  return (
    <header className='th-app-header'>
      <Button className='th-back-button' onClick={onBack}>
        <SvgArrow />
      </Button>

      <div
        className={cn('th-menu-button', 'hamburger', 'hamburger--spin')}
        onClick={toggleSideMenu}
      >
        <span className='hamburger-box'>
          <span className='hamburger-inner' />
        </span>
      </div>

      {customerOptions.isCompany ? (
        <img
          className='th-company-logo'
          src={customerOptions.logo}
          alt='Company Logo'
        />
      ) : (
        <Link href='/' className='th-logo'>
          <SvgLogo />
        </Link>
      )}

      <div className='th-actions'>
        <div className='th-action'>
          <HelpMenu eventCategory='app_header' title={<SvgHelp />} />
        </div>

        {user.isAnonymous === false ? (
          <div className='th-action'>
            <AccountMenu
              eventCategory='app_header'
              title={
                <Avatar
                  className='th-avatar'
                  name={user.displayName}
                  src={user.photoUrl}
                />
              }
            />
          </div>
        ) : null}
      </div>
      <style jsx>{styles}</style>
    </header>
  )
}
