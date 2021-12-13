import Link from 'next/link'
import cn from 'classnames'

import SvgLogo from 'assets/images/logos/logo-hexa.svg'
import SvgFacebook from 'assets/images/social/facebook.svg'
import SvgLinkedin from 'assets/images/social/linkedin.svg'
import SvgTwitter from 'assets/images/social/twitter.svg'
import SvgInstagram from 'assets/images/social/instagram.svg'
import SvgYoutube from 'assets/images/social/youtube.svg'
import { IntercomAPI } from 'components/Intercom'

import styles from './styles.scss'

interface FooterProps {
  className?: string
}

export default function Footer({ className }: FooterProps) {
  function showIntercom() {
    IntercomAPI('show')
  }

  return (
    <footer className={cn('container', 'th-footer', className)}>
      <div className='th-footer-content'>
        <div className='th-navs'>
          <div className='th-about-app'>
            <SvgLogo className='th-logo' />
            <p className='th-app-description'>
              The first AI-Powered analytics platform to optimize REALTOR
              <sup>®</sup>
              &nbsp;performance.
            </p>
          </div>
          <div className='th-column'>
            <div className='th-column-title'>PRODUCT</div>
            <Link href='/'>
              <a className='th-link'>Home</a>
            </Link>
            <Link href='/map'>
              <a className='th-link'>Map Search</a>
            </Link>
            <Link href='/company'>
              <a className='th-link'>Why TopHap?</a>
            </Link>
          </div>
          <div className='th-column'>
            <div className='th-column-title'>COMPANY</div>
            <div className='th-link' onClick={showIntercom}>
              Chat with Us
            </div>
            <a className='th-link' href='mailto:hello@tophap.com'>
              hello@tophap.com
            </a>
          </div>
        </div>

        <div className='th-divider' />

        <div className='th-bottom-navs'>
          <div className='th-legal'>
            <span className='th-copyright'>
              © {new Date().getFullYear()} TopHap. All rights reserved.
            </span>
            <span className='th-bre'>CA DRE #02068772</span>
          </div>

          <div className='th-links'>
            <Link href='/terms'>
              <a className='th-link'>Terms of Use</a>
            </Link>
            <Link href='/policy'>
              <a className='th-link'>Privacy Policy</a>
            </Link>
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

      <style jsx>{styles}</style>
    </footer>
  )
}
