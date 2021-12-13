import React from 'react'

import Button from 'components/Button'
import Link from 'components/Link'
import OverlaySpinner from 'components/OverlaySpinner'
import { Types } from 'store/actions/user'

interface SignUpSuccessProps {
  asyncStatus: TopHap.GlobalState['status']
  user: TopHap.UserState['info']
  stage: TopHap.GlobalState['customerOptions']['stage']

  resendConfirm(payload: any): void
}

export default function SignUpSuccess({
  asyncStatus,
  stage,
  user,
  resendConfirm
}: SignUpSuccessProps) {
  const { uid, email, displayName, licenseNumber, emailVerified } = user

  function onResend() {
    resendConfirm({ uid, email, displayName, licenseNumber })
  }

  return (
    <div className='th-form'>
      <section className='mx-4 px-2'>
        <h1 className='mt-5 mb-4 th-signup-success-title'>
          Welcome to <strong className='th-brand-color'>TopHap</strong>
        </h1>
        <p className='mt-2 text-left'>
          Thank you for registering! Your account has been created successfully.
        </p>
        {!emailVerified && (
          <p className='mt-1 text-left'>
            We have sent an email to verify your account.
          </p>
        )}
      </section>

      <div className='d-flex align-items-center justify-content-center mt-4 mb-5 mx-4 px-3'>
        {!emailVerified && (
          <Button className='mx-2 th-ghost' onClick={onResend}>
            RESEND EMAIL
          </Button>
        )}
        <Link href={stage === 'prod' ? '/map' : '/pricing'} className='mx-2'>
          <Button className='mx-2'>OK</Button>
        </Link>
      </div>
      <OverlaySpinner
        visible={asyncStatus[Types.RESEND_CONFIRM] === 'request'}
        absolute
      />
    </div>
  )
}
