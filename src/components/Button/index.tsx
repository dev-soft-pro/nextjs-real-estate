import React from 'react'
import ButtonBase, { ButtonBaseProps } from '@material-ui/core/ButtonBase'
import cn from 'classnames'

import styles from './styles.scss?type=global'

export interface ButtonProps extends ButtonBaseProps {
  className?: string
  children: React.ReactNode
  hitSlop?: boolean
}

export function Button({
  className,
  children,
  hitSlop,
  ...props
}: ButtonProps) {
  return (
    <ButtonBase
      classes={{
        root: cn('th-button', { 'th-hitslop': hitSlop }, className),
        disabled: 'th-disabled'
      }}
      {...props}
    >
      {children}
      <style jsx>{styles}</style>
    </ButtonBase>
  )
}

export default React.forwardRef((props: ButtonProps, ref) => (
  <Button buttonRef={ref} {...props} />
))
