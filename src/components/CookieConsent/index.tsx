import CookieConsent from 'react-cookie-consent'

import styles from './styles.scss?type=global'

export default function THCookieConsent() {
  return (
    <CookieConsent
      buttonText='Accept'
      disableStyles={true}
      containerClasses='th-cookie-container'
      buttonClasses='th-cookie-button'
      contentClasses='th-cookie-content'
    >
      By using our site, you acknowledge that you have read and understand our
      Cookie Policy, Privacy Policy, and our Terms of Service.
      <style jsx>{styles}</style>
    </CookieConsent>
  )
}
