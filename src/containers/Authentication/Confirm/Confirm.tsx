import React from 'react'
import { useRouter } from 'next/router'
import ResetPassword from '../ResetPassword'
import OverlaySpinner from 'components/OverlaySpinner'
import { Types } from 'store/actions/user'

interface ConfirmProps {
  asyncStatus: TopHap.GlobalState['status']
  confirmUser(payload: any): void
}

export default function Confirm({ asyncStatus, confirmUser }: ConfirmProps) {
  const router = useRouter()

  React.useEffect(() => {
    if (router.query.action === 'verifyEmail') {
      confirmUser(router.query)
    }
  }, [])

  React.useEffect(() => {
    if (asyncStatus[Types.CONFIRM_USER] === 'success') {
      router.push({
        pathname: router.pathname,
        query: {
          auth: 'signin'
        }
      })
    } else if (asyncStatus[Types.CONFIRM_USER] === 'failure') {
      router.push(router.pathname)
    }
  }, [asyncStatus[Types.CONFIRM_USER]])

  if (router.query.action === 'verifyEmail') {
    return (
      <div className='th-confirm-user'>
        <OverlaySpinner
          visible={asyncStatus[Types.CONFIRM_USER] === 'request'}
          text={
            <div>
              <br />
              Please wait while verifying...
            </div>
          }
          absolute
        />
      </div>
    )
  } else {
    return <ResetPassword params={router.query} />
  }
}
