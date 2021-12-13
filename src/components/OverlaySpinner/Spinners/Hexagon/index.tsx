import cn from 'classnames'
import { SpinnerProps } from '../types'
import styles from './styles.scss'

export default function Hexagon({ className, size }: SpinnerProps) {
  return (
    <div className={cn('th-hexagon-loader', className)}>
      <div className={cn('preloader loading')}>
        <span className='slice'></span>
        <span className='slice'></span>
        <span className='slice'></span>
        <span className='slice'></span>
        <span className='slice'></span>
        <span className='slice'></span>
      </div>

      <style jsx>{`
        .th-hexagon-loader {
          margin: 0;
          width: ${size}px;
          height: ${size}px;
          position: relative;
        }
      `}</style>
      <style jsx>{styles}</style>
    </div>
  )
}
