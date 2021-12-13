import React from 'react'
import { useRouter } from 'next/router'
import Button from 'components/Button'
import TextInput from 'components/TextInput'
import Link from 'components/Link'
import OverlaySpinner from 'components/OverlaySpinner'
import { Types } from 'store/actions/user'

import SvgLogo from 'assets/images/logos/logo.svg'

interface ForgotPasswordProps {
  asyncStatus: TopHap.GlobalState['status']
  forgotPassword(email: string): void
}

export default function ForgotPassword({
  asyncStatus,
  forgotPassword
}: ForgotPasswordProps) {
  const [email, setEmail] = React.useState('')
  const router = useRouter()

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()

    forgotPassword(email)
  }

  return (
    <form className='th-form' onSubmit={onSubmit}>
      <section className='mx-4 px-3'>
        <div className='mt-5'>
          <SvgLogo className='th-logo' />
        </div>
        <div className='d-flex justify-content-between align-items-center mt-3 mb-4 py-2'>
          <h1 className='th-form-title'>Forgot Password</h1>
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
          onChange={(e: any) => setEmail(e.target.value)}
          required
        />

        <div className='d-flex flex-column align-items-center mt-4 mb-5'>
          <Button className='th-full-width' type='submit'>
            RESET PASSWORD
          </Button>
          <span className='th-link mt-3'>
            Verification Code will be sent to your email.
          </span>
        </div>
      </section>
      <OverlaySpinner
        visible={asyncStatus[Types.FORGOT_PASSWORD] === 'request'}
        absolute
      />
    </form>
  )
}
