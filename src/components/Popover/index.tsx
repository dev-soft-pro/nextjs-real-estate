import React from 'react'
import { ReactReduxContext } from 'react-redux'
import cn from 'classnames'
import styles from './styles.scss?type=global'

export interface PopoverProps {
  expanded: boolean
  className?: string
  anchor?: string
  children?: React.ReactNode
  onClickOutside?(e: MouseEvent | TouchEvent): void
}

export default class Popover extends React.Component<PopoverProps> {
  static popovers: any[] = []
  refContainer: React.RefObject<HTMLDivElement>

  constructor(props: PopoverProps) {
    super(props)

    this.refContainer = React.createRef()
  }

  componentDidMount() {
    const store: TopHap.StoreState = this.context.store.getState()
    if (store.global.isMobile.any) {
      document.addEventListener('touchend', this.handleClick)
    } else {
      document.addEventListener('click', this.handleClick)
    }
  }

  componentDidUpdate(prevProps: PopoverProps) {
    if (this.props.expanded !== prevProps.expanded) {
      if (this.props.onClickOutside) {
        if (this.props.expanded) {
          setTimeout(() => {
            Popover.popovers = [
              this,
              ...Popover.popovers.filter(e => e !== this)
            ]
          })
        } else {
          setTimeout(() => {
            Popover.popovers = Popover.popovers.filter(e => e !== this)
          })
        }
      }
    }
  }

  componentWillUnmount() {
    const store: TopHap.StoreState = this.context.store.getState()
    if (store.global.isMobile.any) {
      document.removeEventListener('touchend', this.handleClick)
    } else {
      document.removeEventListener('click', this.handleClick)
    }
  }

  handleClick = (e: MouseEvent | TouchEvent) => {
    if (!this.props.onClickOutside) return
    if (Popover.popovers[0] !== this) return
    if (!this.refContainer.current) return

    if (!this.refContainer.current.contains(e.target as Node)) {
      this.props.onClickOutside(e)
    }
  }

  render() {
    const { expanded, children, className, anchor } = this.props

    return (
      <div
        className={cn(
          'th-popover',
          { 'th-popover--expanded': expanded },
          className
        )}
        style={{ transformOrigin: anchor }}
        ref={this.refContainer}
      >
        {children}

        <style jsx>{styles}</style>
      </div>
    )
  }
}

Popover.contextType = ReactReduxContext
