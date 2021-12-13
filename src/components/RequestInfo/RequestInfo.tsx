import React from 'react'
import cn from 'classnames'

import SvgMail from 'assets/images/card/mail_outline.svg'
import Button from 'components/Button'
import OverlaySpinner from 'components/OverlaySpinner'
import TextInput, { TextArea } from 'components/TextInput'
import { logEvent } from 'services/analytics'
import { Types } from 'store/actions/user'
import { useInputState } from 'utils/hook'
import { showSuccess } from 'utils/message'

import styles from './styles.scss?type=global'

interface RequestInfoProps {
  asyncStatus: TopHap.GlobalState['status']
  property: TopHap.Property
  small?: boolean
  user: TopHap.UserState['info']
  onClose?: () => void
  sendFeedback: TopHap.UserCreators['sendFeedback']
}

export default function RequestInfo({
  asyncStatus,
  property,
  small,
  user,
  onClose,
  sendFeedback
}: RequestInfoProps) {
  const [name, setName] = useInputState(user.displayName || '')
  const [phone, setPhone] = useInputState(user.phoneNumber || '')
  const [email, setEmail] = useInputState(user.email || '')
  const address = `${property.displayAddress}, ${property.displayRegion}`
  const [message, setMessage] = useInputState(
    property.status === 'Sold'
      ? `I am interested in selling ${address}`
      : `I am interested in ${address}`
  )
  const isWaiting = React.useRef(false)

  React.useEffect(() => {
    if (asyncStatus[Types.SEND_FEEDBACK] === 'success' && isWaiting.current) {
      ;(async () => {
        await showSuccess({
          title: 'Success',
          content: 'Your message is sent.'
        })
      })()

      isWaiting.current = false

      if (onClose) onClose()
    }
  }, [asyncStatus[Types.SEND_FEEDBACK]])

  function handleSubmit(ev: React.FormEvent<HTMLFormElement>) {
    ev.preventDefault()

    const payload = {
      name,
      phone,
      email,
      message,
      status: property.status,
      link: window.location.href
    }

    sendFeedback({
      from: email,
      subject: 'Request Info',
      payload
    })

    isWaiting.current = true

    logEvent('property_detail', 'request_info', 'submit', {
      id: property.id,
      payload
    })
  }

  return (
    <form className='th-request-info row' onSubmit={handleSubmit}>
      <div className={cn(small ? 'col-12' : 'col-6')}>
        <div className='row'>
          <TextInput
            className={'col-12 my-1'}
            icon='person'
            label='Name'
            placeholder='Name'
            value={name}
            onChange={setName}
            required
          />
          <TextInput
            className='col-12 my-1'
            icon='phone'
            label='Phone'
            placeholder='Phone'
            type='phone'
            value={phone}
            onChange={setPhone}
          />
          <TextInput
            className='col-12 my-1'
            icon='mail'
            label='Email'
            placeholder='Email'
            type='email'
            value={email}
            onChange={setEmail}
            required
          />
        </div>
      </div>
      <div className={cn(small ? 'col-12 mt-1' : 'col-6')}>
        <div className='row'>
          <TextArea
            className='col-12'
            label='Message'
            value={message}
            onChange={setMessage}
            rows={small ? 4 : 6}
            required
          />
          <div className='col-12 d-flex justify-content-end'>
            <Button type='submit' className='th-submit-button'>
              <SvgMail /> Request Info
            </Button>
          </div>
        </div>
      </div>

      <OverlaySpinner
        absolute
        visible={asyncStatus[Types.SEND_FEEDBACK] === 'request'}
      />

      <style jsx>{styles}</style>
    </form>
  )
}
