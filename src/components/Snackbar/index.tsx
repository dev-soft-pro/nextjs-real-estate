import React, { useState } from 'react'
import ReactDOM from 'react-dom'
import MaterialSnackbar, { SnackbarOrigin } from '@material-ui/core/Snackbar'

import styles from './styles.scss?type=global'
import { SnackbarContentProps } from '@material-ui/core'

interface SnackbarProps {
  anchorOrigin?: SnackbarOrigin
  autoHideDuration?: number | null
  defaultOpen?: boolean
  message: SnackbarContentProps['message']
  onClose?(event: React.SyntheticEvent<any>, reason: string): void
}

export default function Snackbar({
  anchorOrigin,
  autoHideDuration,
  defaultOpen,
  message,
  onClose
}: SnackbarProps) {
  const [open, setOpen] = useState(defaultOpen || false)

  function handleClose(event: React.SyntheticEvent<any>, reason: string) {
    setOpen(false)
    if (onClose) onClose(event, reason)
  }

  return (
    <>
      <MaterialSnackbar
        anchorOrigin={anchorOrigin}
        open={open}
        autoHideDuration={autoHideDuration}
        onClose={handleClose}
        ContentProps={{
          'aria-describedby': 'message',
          classes: {
            root: 'th-snackbar-content',
            message: 'th-snackbar-message'
          }
        }}
        message={<span id='message'>{message}</span>}
        classes={{
          root: 'th-snackbar'
        }}
      />
      <style jsx>{styles}</style>
    </>
  )
}

Snackbar.defaultProps = {
  anchorOrigin: { vertical: 'bottom', horizontal: 'left' },
  autoHideDuration: 3000,
  defaultOpen: false
}

Snackbar.show = function({
  message,
  anchorOrigin,
  autoHideDuration,
  onClose
}: SnackbarProps) {
  const root = document.getElementById('__next') as HTMLElement
  const el = document.createElement('div')
  root.appendChild(el)

  function handleClose(
    event: React.SyntheticEvent<any, Event>,
    reason: string
  ) {
    el.parentNode?.removeChild(el)
    if (onClose) onClose(event, reason)
  }

  ReactDOM.render(
    <Snackbar
      anchorOrigin={anchorOrigin}
      autoHideDuration={autoHideDuration}
      defaultOpen={true}
      message={message}
      onClose={handleClose}
    />,
    el
  )
}
