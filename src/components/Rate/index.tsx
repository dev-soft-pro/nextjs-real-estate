import React from 'react'
import cn from 'classnames'
import styles from './styles.scss'

const MAX_COUNT = 5
export default function Rate({
  character = '★',
  value
}: {
  character: string
  value: number
}) {
  return (
    <div className='th-rate'>
      {new Array(MAX_COUNT).fill(1).map((_, index) => (
        <span
          key={index}
          className={cn('th-rate-star', { 'th-rate-star-full': index < value })}
        >
          {character}
        </span>
      ))}
      <style jsx>{styles}</style>
    </div>
  )
}
