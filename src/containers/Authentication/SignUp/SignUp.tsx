import React from 'react'
import { useRouter } from 'next/router'
import GoogleLogin from 'react-google-login'
import FacebookLogin from 'react-facebook-login'
import imgFacebook from 'assets/images/social/facebook.png'

import Button from 'components/Button'
import Checkbox from 'components/Checkbox'
import TextInput from 'components/TextInput'
import Link from 'components/Link'
import OverlaySpinner from 'components/OverlaySpinner'
import notification, { NotificationShowOption } from 'utils/notification'
import { Types } from 'store/actions/user'
import { googleClientId, facebookAppId } from 'configs'

import SvgLogo from 'assets/images/logos/logo.svg'

interface SignUpProps {
  asyncStatus: TopHap.GlobalState['status']
  signUp(payload: any): void
  signInWithGoogle(token: string): void
  signInWithFacebook(token: string): void
}

export default function SignUp({
  asyncStatus,
  signUp,
  signInWithGoogle,
  signInWithFacebook
}: SignUpProps) {
  const [email, setEmail] = React.useState('')
  const [name, setName] = React.useState('')
  const [password, setPassword] = React.useState('')
  const [subscription, setSubscription] = React.useState(true)
  const router = useRouter()

  React.useEffect(() => {
    if (asyncStatus[Types.SIGN_UP] === 'failure') {
      // handle User already exists
      if (asyncStatus.err.code === 'auth/email-already-in-use') {
        const key = 'username_exists_notification'
        const toSignIn = () => {
          notification.close(key)
          router.push({
            pathname: router.pathname,
            query: {
              auth: 'signin'
            }
          })
        }
        notification.show({
          key,
          type: 'error',
          title: 'User Exists!',
          message: asyncStatus.err.message,
          btn: <Button onClick={toSignIn}>Sign In</Button>
        } as NotificationShowOption)
      }
    }
  }, [asyncStatus[Types.SIGN_UP]])

  function _isSigning() {
    return (
      asyncStatus[Types.SIGN_UP] === 'request' ||
      asyncStatus[Types.SIGN_IN_WITH_FACEBOOK] === 'request' ||
      asyncStatus[Types.SIGN_IN_WITH_GOOGLE] === 'request'
    )
  }

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()

    if (_isSigning()) return

    signUp({
      email,
      password,
      name,
      subscription
    })
  }

  function onGoogle(response: any) {
    if (response.error) return

    if (_isSigning()) return

    signInWithGoogle(response.tokenId)
  }

  function onFacebook(response: any) {
    if (!response.accessToken) return

    if (_isSigning()) return

    signInWithFacebook(response.accessToken)
  }

  return (
    <form className='th-form th-signin-form' onSubmit={onSubmit}>
      <section className='mx-1 px-3'>
        <div className='mt-5'>
          <SvgLogo className='th-logo' />
        </div>
        <br />
        <h1 className='th-form-title'>Sign Up for Free</h1>
        <TextInput
          className='my-3'
          icon='person'
          placeholder='Name'
          value={name}
          onChange={(e: any) => setName(e.target.value)}
          required
        />
        <TextInput
          className='my-3'
          icon='mail'
          placeholder='Email'
          type='email'
          value={email}
          onChange={(e: any) => setEmail(e.target.value)}
          required
        />
        <TextInput
          className='my-3'
          icon='lock'
          placeholder='Password'
          type='password'
          pattern='.{6,}'
          title='Password must contain at least 6 characters.'
          value={password}
          onChange={(e: any) => setPassword(e.target.value)}
          required
        />

        <div className='th-subscription mb-2'>
          <Checkbox
            label='TopHap News and Announcements'
            checked={subscription}
            onChange={(e: any) => setSubscription(e.target.checked)}
          />
          <p>
            Keep me up-to-date with TopHap news, release announcements and
            information on the platform and services.
          </p>
        </div>
      </section>

      <div className='d-flex align-items-center mt-4 mx-1 px-3'>
        <Button type='submit' className='th-signup-button'>
          SIGN UP
        </Button>
        <Link
          href={router.pathname}
          as={{ query: { auth: 'signin' } }}
          className='th-link ml-3'
        >
          Already have an account?
        </Link>
      </div>

      <div className='th-divider mt-4' />

      <section className='th-social-buttons mt-4 mb-1 mx-1 px-3'>
        <GoogleLogin
          clientId={googleClientId}
          onSuccess={onGoogle}
          onFailure={onGoogle}
          cookiePolicy={'single_host_origin'}
          buttonText={'Sign in with Google'}
          className='th-google-button'
          theme='dark'
        />
        <FacebookLogin
          appId={facebookAppId}
          callback={onFacebook}
          icon={
            <img
              src={imgFacebook}
              alt='Facebook'
              className='th-facebook-icon'
            />
          }
          cssClass='th-facebook-button'
          // @ts-ignore
          textButton={<span>Continue with Facebook</span>}
          isMobile={false}
        />
      </section>
      <OverlaySpinner visible={_isSigning()} absolute />
    </form>
  )
}
