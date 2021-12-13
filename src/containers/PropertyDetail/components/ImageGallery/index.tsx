import React from 'react'
import ReactDOM from 'react-dom'
import cn from 'classnames'
import PinchZoomPan from 'react-responsive-pinch-zoom-pan'

import Button from 'components/Button'
import SvgList from 'assets/images/icons/bars.svg'
import SvgGrid from 'assets/images/icons/grid.svg'
import SvgClose from 'assets/images/icons/close.svg'

import styles from './styles.scss?type=global'

interface ImageGalleryProps {
  images: string[]
  toggle(): void
  visible: boolean
}

interface ImageGalleryState {
  mode: 'list' | 'grid'
  isImageViewOpened: boolean
  imageIndex: number
}

export default class ImageGallery extends React.PureComponent<
  ImageGalleryProps,
  ImageGalleryState
> {
  root?: HTMLElement
  el: HTMLDivElement
  elBack: HTMLDivElement

  constructor(props: ImageGalleryProps) {
    super(props)

    this.state = {
      mode: 'list',
      isImageViewOpened: false,
      imageIndex: 0
    }

    this.el = document.createElement('div')
    this.elBack = document.createElement('div')
    this.elBack.classList.add('th-image-gallery-overlay')
  }

  componentDidMount() {
    this.root = document.getElementById('__next') as HTMLElement
    this.root.appendChild(this.elBack)
    this.root.appendChild(this.el)
    this.root.classList.toggle('th-gallery-showed', this.props.visible)
  }

  componentDidUpdate(prevProps: ImageGalleryProps) {
    if (this.props.visible !== prevProps.visible) {
      this.root?.classList.toggle('th-gallery-showed', this.props.visible)
    }
  }

  componentWillUnmount() {
    this.root?.removeChild(this.el)
    this.root?.removeChild(this.elBack)
    this.root?.classList.remove('th-gallery-showed')
    window.scrollTo(0, 0)
  }

  toggleMode = () => {
    this.setState(prevState => ({
      mode: prevState.mode === 'list' ? 'grid' : 'list'
    }))
  }

  toggleImageView = (
    e: React.MouseEvent<HTMLDivElement, MouseEvent>,
    index: number
  ) => {
    e.stopPropagation()

    this.setState(prevState => ({
      isImageViewOpened: !prevState.isImageViewOpened,
      imageIndex: index
    }))
  }

  onClose = () => {
    if (this.state.isImageViewOpened) {
      this.setState({
        isImageViewOpened: false
      })
    } else {
      this.props.toggle()
    }
  }

  render() {
    const { mode, isImageViewOpened, imageIndex } = this.state
    const { visible, images } = this.props

    const _content = (
      <div className={cn('th-image-gallery', { 'th-hide': !visible })}>
        <header className='th-gallery-header'>
          <div className='th-gallery-title'>Gallery</div>
          {!isImageViewOpened && (
            <Button className='th-mode-button' onClick={this.toggleMode}>
              {mode === 'list' ? <SvgGrid /> : <SvgList />}
            </Button>
          )}
          <Button className='th-close-button' onClick={this.onClose}>
            <SvgClose />
          </Button>
        </header>

        <div className='th-image-container' onClick={this.onClose}>
          <div className='row w-100'>
            {images.map((e, index) => (
              <div
                key={e}
                className={cn(
                  'th-image-wrapper',
                  mode === 'list' ? 'col-12' : 'col-4'
                )}
                onClick={e => this.toggleImageView(e, index)}
              >
                <img className='th-image' src={e} alt='' />
              </div>
            ))}
          </div>
        </div>

        {isImageViewOpened && (
          <div className='th-image-viewer' onClick={this.onClose}>
            <PinchZoomPan position='center' zoomButtons={false} maxScale={5}>
              <img
                alt=''
                src={images[imageIndex]}
                onClick={e => e.stopPropagation()}
              />
            </PinchZoomPan>
          </div>
        )}

        <style jsx>{styles}</style>
      </div>
    )

    return ReactDOM.createPortal(_content, this.el)
  }
}
