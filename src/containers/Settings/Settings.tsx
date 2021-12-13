import React from 'react'
import Router from 'next/router'
import { NavLink } from 'components/Link'
import OverlaySpinner from 'components/OverlaySpinner'

import styles from './styles.scss?type=global'

interface SettingsProps {
  isAnonymous?: boolean
  passwordResettable: boolean
  stage: TopHap.GlobalState['customerOptions']['stage']
  children: React.ReactNode
}

export default function Settings({
  isAnonymous,
  passwordResettable,
  stage,
  children
}: SettingsProps) {
  React.useEffect(() => {
    if (isAnonymous === true) {
      Router.push('/')
    }
  }, [isAnonymous])

  if (isAnonymous !== false) {
    return <OverlaySpinner visible />
  }

  return (
    <div className='th-settings container'>
      <h1 className='th-page-title'>Account Management</h1>
      <div className='th-page-content'>
        <nav className='th-nav-bar'>
          <NavLink
            activeClassName='th-active'
            className='th-nav-item'
            href='/settings/profile'
          >
            Profile
          </NavLink>
          {passwordResettable && (
            <NavLink
              activeClassName='th-active'
              className='th-nav-item'
              href='/settings/change_password'
            >
              Change Password
            </NavLink>
          )}
          {stage !== 'prod' && (
            <NavLink
              activeClassName='th-active'
              className='th-nav-item'
              href='/settings/billing'
            >
              Billing
            </NavLink>
          )}
        </nav>

        <section className='th-sub-pages'>{children}</section>
      </div>

      <style jsx>{styles}</style>
    </div>
  )
}
