import React, { useState } from 'react'
import ReactDOM from 'react-dom'
import cn from 'classnames'
import Dialog from '@material-ui/core/Dialog'
import SuccessIcon from '@material-ui/icons/CheckCircleOutline'
import ConfirmIcon from '@material-ui/icons/HelpOutline'
import ErrorIcon from '@material-ui/icons/ErrorOutline'
import WarningIcon from '@material-ui/icons/Warning'
import InfoIcon from '@material-ui/icons/InfoOutlined'

import Button from 'components/Button'
import SvgClose from 'assets/images/icons/close.svg'

import styles from './styles.scss?type=global'

interface ModalProps {
  visible: boolean
  maskClosable?: boolean
  scroll?: 'paper' | 'body'
  className?: string
  closeButton?: boolean
  onClose?(): void
  children: React.ReactNode
  [eleName: string]: any
}

export default function Modal({
  visible,
  maskClosable,
  scroll,
  className,
  closeButton,
  onClose,
  children,
  ...props
}: ModalProps) {
  return (
    <Dialog
      open={visible}
      disableBackdropClick={!maskClosable}
      scroll={scroll}
      onClose={onClose}
      classes={{
        paper: cn('th-modal', className)
      }}
      {...props}
    >
      {children}
      {closeButton && (
        <SvgClose className='th-close-button' onClick={onClose} />
      )}

      <style jsx>{styles}</style>
    </Dialog>
  )
}

Modal.defaultProps = {
  closeButton: true,
  maskClosable: true,
  scroll: 'body'
}

export interface AlertDialogProps {
  type?: 'alert' | 'success' | 'info' | 'error' | 'warning' | 'confirm'
  title: string
  content?: React.ReactNode
  okText?: string
  cancelText?: string
  onOk?(): void
  onCancel?(): void
}

function AlertDialog({
  type = 'alert',
  title,
  content,
  okText = 'OK',
  cancelText = 'Cancel',
  onOk,
  onCancel,
  ...props
}: AlertDialogProps) {
  const [open, setOpen] = useState(true)

  function handleOk() {
    setOpen(false)
    if (onOk) onOk()
  }

  function handleCancel() {
    setOpen(false)
    if (onCancel) onCancel()
  }

  return (
    <Dialog
      disableBackdropClick
      open={open}
      onClose={handleCancel}
      classes={{
        paper: 'th-alert-modal'
      }}
      {...props}
    >
      <div className='th-modal-body'>
        {type === 'confirm' && (
          <ConfirmIcon className='th-icon th-confirm-icon' />
        )}
        {type === 'success' && (
          <SuccessIcon className='th-icon th-success-icon' />
        )}
        {type === 'warning' && (
          <WarningIcon className='th-icon th-warning-icon' />
        )}
        {type === 'info' && <InfoIcon className='th-icon th-info-icon' />}
        {type === 'error' && <ErrorIcon className='th-icon th-error-icon' />}
        <div>
          <div className='th-modal-title'>{title}</div>
          <div className='th-modal-content'>{content}</div>
        </div>
      </div>
      <div className='th-modal-actions'>
        {type === 'confirm' && (
          <Button
            className='th-action-button th-cancel-action'
            onClick={handleCancel}
          >
            {cancelText}
          </Button>
        )}
        <Button
          className='th-action-button th-ok-action ml-2'
          onClick={handleOk}
        >
          {okText}
        </Button>
      </div>

      <style jsx>{styles}</style>
    </Dialog>
  )
}

function showAlert({ onCancel, onOk, ...props }: AlertDialogProps) {
  const root = document.getElementById('__next')
  const el = document.createElement('div')
  root?.appendChild(el)

  function handleOk() {
    el.parentNode?.removeChild(el)
    if (onOk) onOk()
  }

  function handleCancel() {
    el.parentNode?.removeChild(el)
    if (onCancel) onCancel()
  }

  ReactDOM.render(
    <AlertDialog onOk={handleOk} onCancel={handleCancel} {...props} />,
    el
  )
}

export function confirm(options: AlertDialogProps) {
  showAlert({
    type: 'confirm',
    ...options
  })
}

export function success(options: AlertDialogProps) {
  showAlert({
    type: 'success',
    ...options
  })
}

export function warning(options: AlertDialogProps) {
  showAlert({
    type: 'warning',
    ...options
  })
}

export function info(options: AlertDialogProps) {
  showAlert({
    type: 'info',
    ...options
  })
}

export function error(options: AlertDialogProps) {
  showAlert({
    type: 'error',
    ...options
  })
}
