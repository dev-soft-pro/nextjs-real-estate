import React from 'react'
import { useRouter } from 'next/router'
import GoogleLogin from 'react-google-login'
import FacebookLogin from 'react-facebook-login'
import imgFacebook from 'assets/images/social/facebook.png'

import Button from 'components/Button'
import TextInput from 'components/TextInput'
import Link from 'components/Link'
import OverlaySpinner from 'components/OverlaySpinner'
import { Types } from 'store/actions/user'
import { useInputState } from 'utils/hook'
import { googleClientId, facebookAppId } from 'configs'

import SvgLogo from 'assets/images/logos/logo.svg'

interface SignInProps {
  asyncStatus: TopHap.GlobalState['status']
  signIn(email: string, password: string): void
  signInWithGoogle(token: string): void
  signInWithFacebook(token: string): void
}

export default function SignIn({
  asyncStatus,
  signIn,
  signInWithGoogle,
  signInWithFacebook
}: SignInProps) {
  const [email, setEmail] = useInputState('')
  const [password, setPassword] = useInputState('')
  const router = useRouter()

  function _isSigning() {
    return (
      asyncStatus[Types.SIGN_IN] === 'request' ||
      asyncStatus[Types.SIGN_IN_WITH_FACEBOOK] === 'request' ||
      asyncStatus[Types.SIGN_IN_WITH_GOOGLE] === 'request'
    )
  }

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()

    if (_isSigning()) return

    signIn(email, password)
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
      <section className='mx-1 px-3 mb-2'>
        <div className='mt-5'>
          <SvgLogo className='th-logo' />
        </div>
        <div className='d-flex justify-content-between align-items-center mt-3 mb-4 py-2'>
          <h1 className='th-form-title'>Sign In</h1>
          <Link href={router.pathname} as={{ query: { auth: 'signup' } }}>
            <Button className='th-ghost'>SIGN UP</Button>
          </Link>
        </div>

        <TextInput
          className='my-3'
          icon='mail'
          placeholder='E-mail'
          type='email'
          value={email}
          onChange={setEmail}
          required
        />
        <TextInput
          className='my-3'
          icon='lock'
          placeholder='Password'
          type='password'
          value={password}
          onChange={setPassword}
          required
        />

        <div className='d-flex align-items-center my-4'>
          <Button type='submit'>SIGN IN</Button>
          <Link
            href={router.pathname}
            as={{ query: { auth: 'forgotpassword' } }}
            className='th-link ml-3'
          >
            Forgot Password?
          </Link>
        </div>
      </section>

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
