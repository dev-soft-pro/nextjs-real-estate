import React from 'react'
import { useRouter } from 'next/router'
import Button from 'components/Button'
import TextInput from 'components/TextInput'
import Link from 'components/Link'
import OverlaySpinner from 'components/OverlaySpinner'
import { Types } from 'store/actions/user'
import { showError } from 'utils/message'

import SvgLogo from 'assets/images/logos/logo.svg'

interface ResetPasswordProps {
  asyncStatus: TopHap.GlobalState['status']
  params: object
  resetPassword(payload: any): void
}

export default function ResetPassword({
  asyncStatus,
  params,
  resetPassword
}: ResetPasswordProps) {
  const [password, setPassword] = React.useState('')
  const [confirm, setConfirm] = React.useState('')
  const router = useRouter()

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()

    if (password === confirm) {
      resetPassword({
        ...params,
        password
      })
    } else {
      await showError({
        title: 'Validation Error...',
        content: 'Password does not match!'
      })
    }
  }

  return (
    <form className='th-form' onSubmit={onSubmit}>
      <section className='mx-4 px-3'>
        <div className='mt-5'>
          <SvgLogo className='th-logo' />
        </div>
        <div className='d-flex justify-content-between align-items-center mt-3 mb-4 py-2'>
          <h1 className='th-form-title'>Reset Password</h1>
          <Link href={router.pathname} as={{ query: { auth: 'signup' } }}>
            <Button className='th-ghost'>SIGN UP</Button>
          </Link>
        </div>

        <TextInput
          className='my-3'
          icon='lock'
          placeholder='Password'
          type='password'
          value={password}
          onChange={(e: any) => setPassword(e.target.value)}
          pattern='.{6,}'
          title='Password must contain at least 6 characters.'
          required
        />

        <TextInput
          className='my-3'
          icon='lock'
          placeholder='Confirm Password'
          type='password'
          value={confirm}
          onChange={(e: any) => setConfirm(e.target.value)}
          pattern='.{6,}'
          title='Password must contain at least 6 characters.'
          required
        />

        <div className='d-flex flex-column align-items-center mt-4 mb-5'>
          <Button className='th-full-width' type='submit'>
            RESET PASSWORD
          </Button>
          <span className='th-link mt-3'>
            {/* Check your email to get the code. */}
          </span>
        </div>
      </section>
      <OverlaySpinner
        visible={asyncStatus[Types.RESET_PASSWORD] === 'request'}
        absolute
      />
    </form>
  )
}
