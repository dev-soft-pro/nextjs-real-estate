import Icon, { IconProps } from '@material-ui/core/Icon'
import styles from './styles.scss?type=global'

export default function THIcon(props: IconProps) {
  return (
    <>
      <Icon {...props} />
      <style jsx>{styles}</style>
    </>
  )
}
