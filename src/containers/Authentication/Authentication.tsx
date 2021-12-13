import { useMemo } from 'react'
import dynamic from 'next/dynamic'
import { useRouter } from 'next/router'
import qs from 'querystring'
import Modal from 'components/Modal'
import styles from './styles.scss?type=global'

const SignIn = dynamic(() => import('./SignIn'))
const SignUp = dynamic(() => import('./SignUp'))
const ForgotPassword = dynamic(() => import('./ForgotPassword'))
const Confirm = dynamic(() => import('./Confirm'))
const SignUpSuccess = dynamic(() => import('./SignUpSuccess'))

interface AuthenticationProps {
  url: string
  authenticated: boolean
}

export default function Authentication({
  url,
  authenticated
}: AuthenticationProps) {
  const type = useMemo(() => {
    // decode url manually instead of using query of next router
    // to support dynamic routing
    const reg = /\?(.*)$/
    const match = url.match(reg)
    if (match) {
      const query = qs.parse(match[1])
      return query.auth
    }
  }, [url])
  const router = useRouter()

  if (!type) return null

  function onClose() {
    const reg = /\?(.*)$/
    const match = url.match(reg)
    if (match) {
      const query = qs.parse(match[1])
      delete query.auth
      const encoded = qs.encode(query)

      router.replace(
        router.pathname,
        router.asPath.replace(reg, encoded ? '?' + encoded : '')
      )
    }
  }

  let _component = null
  if (authenticated) {
    if (type === 'verifications') _component = <Confirm />
    if (type === 'signupsuccess') _component = <SignUpSuccess />
  } else {
    if (type === 'signin') _component = <SignIn />
    if (type === 'signup') _component = <SignUp />
    if (type === 'forgotpassword') _component = <ForgotPassword />
    if (type === 'verifications') _component = <Confirm />
  }

  if (!_component) {
    onClose()
    return null
  }

  return (
    <Modal
      visible={_component != null}
      maskClosable={type === 'verifications'}
      className='th-authentication-modal'
      onClose={onClose}
    >
      <div className='th-authentication'>{_component}</div>

      <style jsx>{styles}</style>
    </Modal>
  )
}
