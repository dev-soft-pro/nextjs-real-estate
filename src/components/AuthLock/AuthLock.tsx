import { useRouter } from 'next/router'
import cn from 'classnames'

import Button from 'components/Button'
import { logEvent } from 'services/analytics'

import SvgLock from 'assets/images/icons/lock.svg'
import styles from './styles.scss?type=global'

interface AuthLockProps {
  authenticated: boolean
  transparent?: boolean
  dark?: boolean
  event: string
}

export default function AuthLock({
  authenticated,
  transparent,
  dark,
  event
}: AuthLockProps) {
  const router = useRouter()
  if (authenticated) return null

  function toSignUp() {
    router.replace(router.pathname, {
      pathname: router.asPath,
      query: {
        auth: 'signup'
      }
    })
    logEvent('lock', 'lock_auth', event)
  }

  return (
    <div
      className={cn(
        'th-auth-lock',
        { 'th-mode-dark': dark },
        { 'th-mode-transparent': transparent }
      )}
      onClick={e => e.stopPropagation()}
    >
      <SvgLock className='th-icon' onClick={toSignUp} />
      <Button className='th-unlock-button' onClick={toSignUp}>
        Sign In to Unlock
      </Button>

      <style jsx>{styles}</style>
    </div>
  )
}
