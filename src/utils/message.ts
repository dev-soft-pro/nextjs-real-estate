import { success, error, confirm, AlertDialogProps } from 'components/Modal'

export function showSuccess(message: AlertDialogProps) {
  return new Promise(resolve => {
    success({
      ...message,
      onOk() {
        resolve('OK')
      }
    })
  })
}

export function showError(message: AlertDialogProps) {
  return new Promise(resolve => {
    error({
      ...message,
      onOk() {
        resolve('OK')
      }
    })
  })
}

export function showConfirm(message: AlertDialogProps) {
  return new Promise(resolve => {
    confirm({
      ...message,
      onOk() {
        resolve('OK')
      },
      onCancel() {
        resolve('Cancel')
      }
    })
  })
}
