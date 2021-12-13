import React from 'react'
import { toast } from 'react-toastify'
import Button from 'components/Button'
import CloseIcon from '@material-ui/icons/Close'
import SuccessIcon from '@material-ui/icons/CheckCircleOutline'
import ErrorIcon from '@material-ui/icons/ErrorOutline'
import WarningIcon from '@material-ui/icons/Warning'
import InfoIcon from '@material-ui/icons/InfoOutlined'

interface NotificationProps {
  type: 'default' | 'success' | 'warning' | 'info' | 'error'
  title: React.ReactNode
  message: React.ReactNode
  btn: React.ReactNode
}

export interface NotificationShowOption extends NotificationProps {
  key: string
  onClose(): any
}

function Notification({ type, title, message, btn }: NotificationProps) {
  return (
    <div className='th-notification'>
      <div className='th-notification-content'>
        {type === 'success' && <SuccessIcon className='th-icon th-help-icon' />}
        {type === 'warning' && (
          <WarningIcon className='th-icon th-warning-icon' />
        )}
        {type === 'info' && <InfoIcon className='th-icon th-info-icon' />}
        {type === 'error' && <ErrorIcon className='th-icon th-error-icon' />}
        <div>
          <div className='th-notification-title'>{title}</div>
          <div className='th-notification-message'>{message}</div>
        </div>
      </div>
      {btn && <div className='th-notification-action'>{btn}</div>}
    </div>
  )
}

const notification = {
  show: function({
    type,
    btn,
    key,
    title,
    message,
    onClose
  }: NotificationShowOption) {
    let t
    if (!type || type === 'default') {
      t = toast
    } else {
      // @ts-ignore
      t = toast[type]
    }

    t(<Notification type={type} btn={btn} title={title} message={message} />, {
      className: 'th-notification-wrapper',
      closeButton: (
        <>
          <Button className='th-close-button'>
            <CloseIcon />
          </Button>
        </>
      ),
      toastId: key,
      onClose
    })
  },
  close: function(key: string) {
    toast.dismiss(key)
  }
}

export default notification
