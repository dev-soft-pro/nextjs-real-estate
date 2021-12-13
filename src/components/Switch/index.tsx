import React from 'react'
import Switch, { SwitchProps } from '@material-ui/core/Switch'

export default function THSwitch({ checked, onChange, ...props }: SwitchProps) {
  return <Switch checked={checked} onChange={onChange} {...props} />
}
