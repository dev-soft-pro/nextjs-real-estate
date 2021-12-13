import React from 'react'
import { Types } from 'store/actions/user'

import Avatar from 'components/Avatar'
import Checkbox from 'components/Checkbox'
import Modal, { error } from 'components/Modal'
import OverlaySpinner from 'components/OverlaySpinner'
import Button from 'components/Button'
import TextInput from 'components/TextInput'
import PhotoEditor from 'components/PhotoEditor'
import { validateUsername } from 'services/user'
import { showConfirm } from 'utils/message'

import styles from './styles.scss?type=global'

interface ProfileProps {
  asyncStatus: TopHap.GlobalState['status']
  user: TopHap.UserState['info']
  closeAccount(): void
  updateProfile(payload: any): void
}

export default function Profile({
  asyncStatus,
  user,
  closeAccount,
  updateProfile
}: ProfileProps) {
  const [isUsernameValid, setUsernameValid] = React.useState(true)
  const [username, setUsername] = React.useState(user.username)
  const [email, setEmail] = React.useState(user.email)
  const [phoneNumber, setPhoneNumber] = React.useState(user.phoneNumber)
  const [photoUrl, setPhotoUrl] = React.useState(user.photoUrl)
  const [unsubscribed, setUnsubscribed] = React.useState(user.unsubscribed)
  const [displayName, setDisplayName] = React.useState(user.displayName)
  const [photoSrc, setPhotoSrc] = React.useState<string | undefined>(undefined)
  const fileInput = React.useRef<HTMLInputElement>(null)

  React.useEffect(() => {
    setUsername(user.username)
    setEmail(user.email)
    setPhoneNumber(user.phoneNumber)
    setPhotoUrl(user.photoUrl)
    setUnsubscribed(user.unsubscribed)
    setDisplayName(user.displayName)
  }, [user])

  function onChangeUsername(e: any) {
    const username = e.target.value
    if (username !== user.username) {
      validateUsername(username).then(isValid => {
        setUsernameValid(isValid)
      })
    } else {
      setUsernameValid(true)
    }
    setUsername(username)
  }

  function onChangePhoto(e: any) {
    e.preventDefault()

    let files
    if (e.dataTransfer) {
      files = e.dataTransfer.files
    } else if (e.target) {
      files = e.target.files
    }

    const reader = new FileReader()
    reader.onload = () => {
      setPhotoSrc(reader.result as string)
    }
    reader.readAsDataURL(files[0])
    e.target.value = null
  }

  function onSelect(dataUrl: any) {
    setPhotoUrl(dataUrl)
    setPhotoSrc(undefined)
  }

  async function onCloseAccount() {
    const res = await showConfirm({
      title: 'Are you sure?',
      content: (
        <span>
          You can&apos;t revert this action.
          <br />
          Do you really want to delete your account?
        </span>
      ),
      okText: 'Yes',
      cancelText: 'No'
    })

    if (res === 'OK') {
      closeAccount()
    }
  }

  async function onSave(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()

    if (user.username !== username) {
      const isValidUsername = await validateUsername(username)
      if (!isValidUsername) {
        error({
          title: 'Duplicated username',
          content: 'The username already exists. Please choose another.'
        })
        return
      }
    }

    const updates: any = {}
    if (user.username !== username) updates.username = username
    if (user.displayName !== displayName) updates.displayName = displayName
    if (user.phoneNumber !== phoneNumber) {
      updates.phoneNumber = phoneNumber === '' ? null : phoneNumber
    }
    if (user.photoUrl !== photoUrl) updates.photoUrl = photoUrl
    if (user.unsubscribed !== unsubscribed) updates.unsubscribed = unsubscribed

    updateProfile(updates)
  }

  return (
    <>
      <form className='th-profile th-sub-page' onSubmit={onSave}>
        <h2 className='th-sub-page-title'>Profile</h2>

        <div className='text-center pb-4'>
          <Button
            className='th-avatar-wrapper'
            onClick={() => fileInput.current?.click()}
          >
            <Avatar className='th-avatar' name={displayName} src={photoUrl} />
          </Button>
          <p className='th-avatar-description mt-2'>click avatar to change</p>
        </div>
        <input
          ref={fileInput}
          type='file'
          accept='image/*'
          onChange={onChangePhoto}
          hidden
        />

        <TextInput
          className='my-2'
          label='Name'
          icon='person'
          placeholder='Name'
          value={displayName || ''}
          onChange={(e: any) => setDisplayName(e.target.value)}
          required
        />

        <TextInput
          className='mt-2'
          icon='person'
          label='Username'
          placeholder='Username'
          pattern='^(?!.*\.(?:com|net))[A-Za-z0-9.]{5,}$'
          title='Must contain only alphanumeric characters or a period, and at least 5 or more characters'
          value={username || ''}
          onChange={onChangeUsername}
          required
        />

        {isUsernameValid ? null : (
          <div className='th-username-validate mb-2'>Same username exists</div>
        )}

        <TextInput
          className='my-2'
          icon='phone'
          label='Phone Number'
          placeholder='Phone Number'
          value={phoneNumber || ''}
          onChange={(e: any) => setPhoneNumber(e.target.value)}
        />

        <TextInput
          className='my-2'
          icon='mail'
          label='Email'
          placeholder='Email'
          value={email || ''}
          onChange={(e: any) => setEmail(e.target.value)}
          readOnly
        />

        <div className='th-subscription mt-3 mb-2'>
          <Checkbox
            label='TopHap News and Announcements'
            checked={unsubscribed === false}
            onChange={e => setUnsubscribed(!e.target.checked)}
          />
          <p>
            Keep me up-to-date with TopHap news, release announcements and
            information on the platform and services.
          </p>
        </div>

        <Button className='th-save-button mt-3 mb-2' type='submit'>
          Save Changes
        </Button>

        <OverlaySpinner
          absolute={asyncStatus[Types.UPDATE_PROFILE] === 'request'}
          visible={
            asyncStatus[Types.UPDATE_PROFILE] === 'request' ||
            asyncStatus[Types.CLOSE_ACCOUNT] === 'request'
          }
        />
      </form>

      <div className='mt-4 px-md-4 d-flex align-items-center'>
        <Button className='th-close-account-button' onClick={onCloseAccount}>
          Delete Account
        </Button>
        <span className='th-close-account-label'>
          By deleting this account, you will lose your all data.
        </span>
      </div>

      <Modal
        visible={photoSrc != null}
        onClose={() => setPhotoSrc(undefined)}
        className='th-photo-editor-modal'
      >
        <PhotoEditor src={photoSrc} onSelect={onSelect} />
      </Modal>
      <style jsx>{styles}</style>
    </>
  )
}
