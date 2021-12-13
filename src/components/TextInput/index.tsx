import cn from 'classnames'
import Icon from 'components/Icon'

import styles from './styles.scss?type=global'

interface InputProps {
  className: string
  label?: React.ReactNode
  icon?: string
  onChange?(e: React.ChangeEvent): void
  [ele: string]: any
}

export default function TextInput({
  className,
  label,
  icon,
  ...props
}: InputProps) {
  return (
    <div className={cn('th-input-container', className)}>
      {label ? <label className='th-input-label'>{label}</label> : null}
      <div className='th-input-wrapper'>
        {icon && <Icon className='th-input-icon'>{icon}</Icon>}
        <input className='th-input' {...props} />
      </div>

      <style jsx>{styles}</style>
    </div>
  )
}

export function TextArea({ className, label, ...props }: InputProps) {
  return (
    <div className={cn('th-input-container', className)}>
      {label ? <label className='th-input-label'>{label}</label> : null}
      <div className='th-input-wrapper'>
        <textarea className='th-textarea' {...props} />
      </div>
      <style jsx>{styles}</style>
    </div>
  )
}
