import React from 'react'
import InputRange from 'react-input-range'

import styles from './styles.scss?type=global'

export default function RangeSlider({ ...props }) {
  return (
    <>
      <InputRange {...props} />
      <style jsx>{styles}</style>
    </>
  )
}
