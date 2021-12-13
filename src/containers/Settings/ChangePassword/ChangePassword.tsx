import React from 'react'

import Button from 'components/Button'
import OverlaySpinner from 'components/OverlaySpinner'
import TextInput from 'components/TextInput'

import { Types } from 'store/actions/user'
import { useInputState } from 'utils/hook'
import { showError } from 'utils/message'

import styles from './styles.scss?type=global'

interface ChangePasswordProps {
  asyncStatus: TopHap.GlobalState['status']
  updatePassword: TopHap.UserCreators['updatePassword']
}

export default function ChangePassword({
  asyncStatus,
  updatePassword
}: ChangePasswordProps) {
  const [oldPassword, setOldPassword] = useInputState('')
  const [password, setPassword] = useInputState('')
  const [confirm, setConfirm] = useInputState('')

  async function onSubmit(ev: React.FormEvent<HTMLFormElement>) {
    ev.preventDefault()

    if (password !== confirm) {
      await showError({
        title: 'Validation Error...',
        content: 'Password does not match!'
      })
    } else {
      await updatePassword(oldPassword, password)
      setOldPassword('')
      setPassword('')
      setConfirm('')
    }
  }

  return (
    <form className='th-sub-page th-change-password' onSubmit={onSubmit}>
      <h2 className='th-sub-page-title'>Change Password</h2>
      <TextInput
        className='mt-4 mb-2'
        label='Old Password'
        icon='lock'
        placeholder='Old Password'
        type='password'
        value={oldPassword}
        onChange={setOldPassword}
        required
      />
      <TextInput
        className='my-2'
        label='New Password'
        icon='lock'
        placeholder='New Password'
        type='password'
        value={password}
        onChange={setPassword}
        required
      />
      <TextInput
        className='my-2'
        label='Confirm New Password'
        icon='lock'
        placeholder='Confirm New Password'
        type='password'
        value={confirm}
        onChange={setConfirm}
        required
      />
      <Button className='th-save-button mt-3 mb-2' type='submit'>
        Change Password
      </Button>

      <OverlaySpinner
        absolute
        visible={asyncStatus[Types.UPDATE_PASSWORD] === 'request'}
      />

      <style jsx>{styles}</style>
    </form>
  )
}
