import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/router'
import cn from 'classnames'

import Avatar from 'components/Avatar'
import Link from 'components/Link'
import Popover from 'components/Popover'
import { hash2MapUrl } from 'utils/url'
import { DropMenu, LinkMenuItem } from './Menu'
import AccountMenu from './Menu/AccountMenu'
import HelpMenu from './Menu/HelpMenu'

import SvgLogo from 'assets/images/logos/logo-beta.svg'
import SvgLogoHexa from 'assets/images/logos/logo-hexa.svg'
import SvgArrow from 'assets/images/icons/arrow-circle-o-right.svg'
import SvgFacebook from 'assets/images/landing/facebook.svg'
import SvgLinkedin from 'assets/images/landing/linkedin.svg'
import SvgTwitter from 'assets/images/landing/twitter.svg'
import SvgInstagram from 'assets/images/landing/instagram.svg'
import SvgYoutube from 'assets/images/landing/youtube.svg'

import { MAP_PAGE } from 'consts/url'
import { logEvent } from 'services/analytics'
import { initialState as initPreferences } from 'store/reducers/preferences'

import styles from './styles.scss?type=global'

interface HeaderProps {
  customerOptions: TopHap.GlobalState['customerOptions']
  viewportWidth: number
  isMobile: boolean
  transparentable?: boolean
  user: TopHap.UserState['info']
}

const SMALL_LOGO_BREAKPOINT = 1220
const LINKS_BREAKPOINT = 980
const FULL_MENU_BREAKPOINT = 560

export default function Header({
  customerOptions,
  viewportWidth,
  transparentable,
  isMobile,
  user
}: HeaderProps) {
  const [menuOpened, showMenu] = useState(false)
  const [isTop, setTop] = useState(true)
  const refMenu = useRef<HTMLDivElement>(null)
  const router = useRouter()

  useEffect(() => {
    if (transparentable) {
      window.addEventListener('scroll', onScroll)

      return () => {
        window.removeEventListener('scroll', onScroll)
      }
    }
  }, [transparentable])

  useEffect(() => {
    document.body.classList.toggle('th-main-menu-showed', menuOpened)
  }, [menuOpened])

  function onScroll() {
    if (window.pageYOffset < 80) {
      setTop(true)
    } else {
      setTop(false)
    }
  }

  function toggleMenu() {
    showMenu(!menuOpened)
    if (!menuOpened) {
      logEvent('header', 'main_menu', 'click')
    }
  }

  function closeMenu(e: any) {
    if (e.target && refMenu.current && refMenu.current.contains(e.target)) {
      return
    }

    showMenu(false)
  }

  function onDescriptiveMetric(metric: string) {
    return function(e: any) {
      const hash = {
        d: {
          ...initPreferences.map.descriptive,
          metric
        }
      }
      router.push(MAP_PAGE, hash2MapUrl(hash))

      closeMenu(e)

      logEvent('header', 'menu_item', metric)
    }
  }

  function onNewConstruction(ev: React.MouseEvent<HTMLElement, MouseEvent>) {
    const currentYear = new Date().getFullYear()
    const hash = {
      f: { year_built: { min: currentYear - 2 } },
      p: {
        ...initPreferences.map.properties,
        enabled: true
      },
      sv: true
    }
    router.push(MAP_PAGE, hash2MapUrl(hash))

    closeMenu(ev)

    logEvent('header', 'menu_item', 'new_construction')
  }

  function onRecentlySold(ev: React.MouseEvent<HTMLElement, MouseEvent>) {
    const hash = {
      f: { status: { close_date: { min: 'now-1y/d' }, values: ['Sold'] } },
      p: {
        ...initPreferences.map.properties,
        enabled: true
      },
      sv: true
    }
    router.push(MAP_PAGE, hash2MapUrl(hash))

    closeMenu(ev)

    logEvent('header', 'menu_item', 'recently_sold')
  }

  function onAllProperties(ev: React.MouseEvent<HTMLElement, MouseEvent>) {
    const hash = {
      p: {
        ...initPreferences.map.properties,
        enabled: true
      },
      sv: true
    }
    router.push(MAP_PAGE, hash2MapUrl(hash))

    closeMenu(ev)

    logEvent('header', 'menu_item', 'all_properties')
  }

  function onLogo() {
    logEvent('header', 'logo', 'click')
  }

  function onPricing(ev: React.MouseEvent<HTMLElement, MouseEvent>) {
    closeMenu(ev)

    logEvent('header', 'menu_item', 'pricing')
  }

  function onCompany(ev: React.MouseEvent<HTMLElement, MouseEvent>) {
    closeMenu(ev)

    logEvent('header', 'menu_item', 'company')
  }

  function onSignIn(ev: React.MouseEvent<HTMLElement, MouseEvent>) {
    closeMenu(ev)

    logEvent('header', 'login', 'click')
  }

  function onSignUp(ev: React.MouseEvent<HTMLElement, MouseEvent>) {
    closeMenu(ev)

    logEvent('header', 'sign_up', 'click')
  }

  function _renderMenuButton() {
    if (viewportWidth > LINKS_BREAKPOINT) return null
    return (
      <div
        className={cn('th-menu-button', 'hamburger', 'hamburger--spin', {
          'is-active': menuOpened
        })}
        onClick={toggleMenu}
        ref={refMenu}
      >
        <span className='hamburger-box'>
          <span className='hamburger-inner' />
        </span>
      </div>
    )
  }

  function _renderMenu() {
    if (viewportWidth > LINKS_BREAKPOINT) return null
    const menu = (
      <div
        className={cn('th-header-menu', {
          'th-header-menu--expanded': menuOpened
        })}
      >
        <div className='th-menu-content'>
          {_renderLinks('click')}
          {viewportWidth <= FULL_MENU_BREAKPOINT && _renderAuthActions()}

          <hr className='th-divider' />

          <div className='th-menu-footer'>
            <p className='th-copyright'>
              © {new Date().getFullYear()} TopHap. All rights reserved.
            </p>
            <div>
              <a className='th-page-link' href='/terms'>
                Terms of Use
              </a>
              <a className='th-page-link' href='/policy'>
                Privacy Policy
              </a>
            </div>
            <div className='th-social-links'>
              <a
                className='th-social-icon'
                title='Youtube'
                target='_blank'
                rel='noopener noreferrer'
                href='https://www.youtube.com/channel/UCglZdqeNJxER07DigcKhgzg/'
              >
                <SvgYoutube />
              </a>
              <a
                className='th-social-icon'
                title='Twitter'
                target='_blank'
                rel='noopener noreferrer'
                href='https://twitter.com/tophapinc'
              >
                <SvgTwitter />
              </a>
              <a
                className='th-social-icon'
                title='Facebook'
                target='_blank'
                rel='noopener noreferrer'
                href='https://www.facebook.com/tophapinc'
              >
                <SvgFacebook />
              </a>
              <a
                className='th-social-icon'
                title='LinkedIn'
                target='_blank'
                rel='noopener noreferrer'
                href='https://www.linkedin.com/company/tophap'
              >
                <SvgLinkedin />
              </a>
              <a
                className='th-social-icon'
                title='Instagram'
                target='_blank'
                rel='noopener noreferrer'
                href='https://www.instagram.com/tophapinc'
              >
                <SvgInstagram />
              </a>
            </div>
          </div>
        </div>
      </div>
    )

    if (viewportWidth <= FULL_MENU_BREAKPOINT) {
      return (
        <div
          className='th-header-menu-container'
          onScroll={e => e.stopPropagation()}
        >
          {menu}
        </div>
      )
    }

    return (
      <Popover
        className='th-header-menu-container'
        expanded={menuOpened}
        onClickOutside={closeMenu}
      >
        <div className='th-triangle-up' />
        {menu}
      </Popover>
    )
  }

  function _renderLinks(preferMode: 'hover' | 'click' = 'hover') {
    const mode = isMobile ? 'click' : preferMode
    return (
      <div className='th-links'>
        <DropMenu title='Research Markets' mode={mode}>
          <DropMenu.Item onClick={onDescriptiveMetric('estimate_price')}>
            Value Map
          </DropMenu.Item>
          <DropMenu.Item onClick={onDescriptiveMetric('estimate_ppsf')}>
            Price / ft<sup>2</sup> Map
          </DropMenu.Item>
          <DropMenu.Item onClick={onDescriptiveMetric('living_area')}>
            Living Area Map
          </DropMenu.Item>
          <DropMenu.Item onClick={onDescriptiveMetric('lot_size_acres')}>
            Lot Size Map
          </DropMenu.Item>
        </DropMenu>

        <DropMenu title='Analyze Properties' mode={mode}>
          <DropMenu.Item onClick={onAllProperties}>
            All Active Listings
          </DropMenu.Item>
          <DropMenu.Item onClick={onRecentlySold}>Recently Sold</DropMenu.Item>
          <DropMenu.Item onClick={onNewConstruction}>
            New Construction
          </DropMenu.Item>
        </DropMenu>

        {customerOptions.stage !== 'prod' && (
          <LinkMenuItem href='/pricing' onClick={onPricing}>
            Pricing
          </LinkMenuItem>
        )}
        <LinkMenuItem href='/company' onClick={onCompany}>
          News
        </LinkMenuItem>
        <LinkMenuItem href='/company' onClick={onCompany}>
          Gallery
        </LinkMenuItem>
        <LinkMenuItem href='/company' onClick={onCompany}>
          Why TopHap?
        </LinkMenuItem>
      </div>
    )
  }

  function _renderAuthActions() {
    if (user.isAnonymous === false) return null

    return (
      <div className='th-auth-actions'>
        <Link
          href={router.pathname}
          as={{ query: { auth: 'signin' } }}
          className='th-signin-button'
          onClick={onSignIn}
        >
          Sign In
        </Link>

        <Link
          href={router.pathname}
          as={{ query: { auth: 'signup' } }}
          className='th-signup-button'
          onClick={onSignUp}
        >
          <span>Sign Up Free</span>
          <SvgArrow />
        </Link>
      </div>
    )
  }

  function _renderUserAvatar() {
    if (user.isAnonymous !== false) return null

    return (
      <AccountMenu
        eventCategory='header'
        title={
          <Avatar
            className='th-avatar'
            name={user.displayName}
            src={user.photoUrl}
          />
        }
      />
    )
  }

  const transparent =
    transparentable &&
    (viewportWidth > FULL_MENU_BREAKPOINT || !menuOpened) &&
    isTop

  return (
    <header className={cn('th-header', { 'th-transparent': transparent })}>
      {customerOptions.isCompany ? (
        <img
          className='th-company-logo'
          src={customerOptions.logo}
          alt='Company Logo'
          onClick={onLogo}
        />
      ) : (
        <Link href='/' className='th-logo' onClick={onLogo}>
          <SvgLogo />
        </Link>
      )}

      {viewportWidth > LINKS_BREAKPOINT ? (
        _renderLinks()
      ) : (
        <div style={{ flex: 1 }} />
      )}
      {viewportWidth > FULL_MENU_BREAKPOINT && _renderAuthActions()}
      {_renderUserAvatar()}
      <HelpMenu eventCategory='header' onItem={closeMenu} />
      {_renderMenuButton()}
      {_renderMenu()}

      {customerOptions.isCompany && (
        <Link href='/'>
          <a className='th-logo th-right'>
            {viewportWidth > SMALL_LOGO_BREAKPOINT ? (
              <SvgLogo />
            ) : (
              <SvgLogoHexa className='th-hexa-logo' />
            )}
          </a>
        </Link>
      )}
      <style jsx>{styles}</style>
    </header>
  )
}
