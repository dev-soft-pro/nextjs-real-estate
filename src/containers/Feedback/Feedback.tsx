import { useEffect } from 'react'
import Button from 'components/Button'
import Modal from 'components/Modal'
import OverlaySpinner from 'components/OverlaySpinner'
import Select, { Option } from 'components/Select'
import TextInput, { TextArea } from 'components/TextInput'

import { FEEDBACK_SUBJECTS } from 'consts/index'
import { Types } from 'store/actions/user'
import { useInputState, useIsMounted } from 'utils/hook'

import styles from './styles.scss?type=global'

interface FeedbackProps {
  asyncStatus: TopHap.GlobalState['status']
  user: TopHap.UserState['info']
  visible: boolean
  onCancel(): void
  sendFeedback: TopHap.UserCreators['sendFeedback']
}

export default function Feedback({
  user,
  asyncStatus,
  visible,
  onCancel,
  sendFeedback
}: FeedbackProps) {
  const [name, setName] = useInputState(user.displayName || '')
  const [email, setEmail] = useInputState(user.email || '')
  const [subject, setSubject] = useInputState('Question')
  const [message, setMessage] = useInputState('')

  useEffect(() => {
    setName(name || user.displayName || '')
    setEmail(email || user.email || '')
  }, [user])

  useEffect(() => {
    if (asyncStatus[Types.SEND_FEEDBACK] === 'success' && isMounted.current) {
      setMessage('')
      onCancel()
    }
  }, [asyncStatus[Types.SEND_FEEDBACK]])

  const isMounted = useIsMounted()

  async function onSubmit(ev: React.FormEvent<HTMLFormElement>) {
    ev.preventDefault()
    sendFeedback({
      from: email,
      subject,
      payload: { name, email, subject, message }
    })
  }

  return (
    <Modal visible={visible} onClose={onCancel} className='th-feedback-modal'>
      <form className='th-feedback' onSubmit={onSubmit}>
        <h2 className='th-modal-title'>Feedback</h2>

        <div className='row my-2'>
          <TextInput
            className='col-12 col-md-6'
            label='Name'
            icon='person'
            placeholder='Name'
            value={name}
            onChange={e => setName(e)}
            required
          />
          <TextInput
            className='col-12 col-md-6'
            icon='mail'
            label='Email'
            placeholder='Email'
            value={email}
            type='email'
            onChange={e => setEmail(e)}
            required
          />
        </div>

        <div className='row my-2'>
          <Select
            className='col-12'
            label='Subject'
            value={subject}
            onChange={e => setSubject(e)}
          >
            {FEEDBACK_SUBJECTS.map(e => (
              <Option key={e} value={e}>
                {e}
              </Option>
            ))}
          </Select>
        </div>

        <div className='row my-2'>
          <TextArea
            className='col-12'
            icon=''
            label='Message'
            value={message}
            onChange={e => setMessage(e)}
            rows={4}
            required
          />
        </div>

        <div className='row'>
          <div className='col-12'>
            <Button className='th-send-button' type='submit'>
              Send Message
            </Button>
          </div>
        </div>
        <OverlaySpinner
          absolute
          visible={asyncStatus[Types.SEND_FEEDBACK] === 'request'}
        />
      </form>

      <style jsx>{styles}</style>
    </Modal>
  )
}
