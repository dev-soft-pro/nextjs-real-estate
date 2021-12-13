import dynamic from 'next/dynamic'
import cn from 'classnames'
import styles from './styles.scss'

const FoldingCube = dynamic(() => import('./Spinners/FoldingCube'))
const Circle = dynamic(() => import('./Spinners/Circle'))
const Hexagon = dynamic(() => import('./Spinners/Hexagon'))

interface OverlaySpinnerProps {
  visible: boolean
  size: number
  color: string
  text?: React.ReactNode
  type: 'folding-cube' | 'circle' | 'hexagon'
  absolute: boolean
}

export default function OverlaySpinner({
  visible,
  size,
  color,
  text,
  absolute,
  type
}: OverlaySpinnerProps) {
  return (
    <div
      className={cn(
        'th-overlay',
        { 'th-overlay--hidden': !visible },
        { 'th-overlay--absolute': absolute }
      )}
    >
      {type === 'folding-cube' && <FoldingCube color={color} size={size} />}
      {type === 'circle' && <Circle color={color} size={size} />}
      {type === 'hexagon' && <Hexagon color={color} size={size} />}
      <div className='th-overlay__text mt-1' style={{ color: color }}>
        {text}
      </div>

      <style jsx>{styles}</style>
    </div>
  )
}

OverlaySpinner.defaultProps = {
  size: 32,
  color: '#6b87e9',
  text: '',
  absolute: false,
  type: 'hexagon',
  visible: false
}
