import React from 'react'
import Slider from 'react-slick'

import Button from 'components/Button'
import SvgArrow from 'assets/images/carousel/arrow-forward.svg'
import SvgImage from 'assets/images/icons/image.svg'

import styles from './styles.scss?type=global'

interface ImageViewerProps {
  currentIndex: number
  images: string[]
  onChangeIndex(index: number): void
  onViewGallery(): void
}

function ImageViewer({
  currentIndex,
  images,
  onChangeIndex,
  onViewGallery
}: ImageViewerProps) {
  const refSlider = React.useRef<Slider>(null)
  const isChanging = React.useRef<boolean>(false)

  React.useEffect(() => {
    if (refSlider.current) {
      refSlider.current.slickGoTo(currentIndex, true)
    }
  }, [refSlider.current, currentIndex])

  function onPrev(ev: React.MouseEvent<HTMLButtonElement, MouseEvent>) {
    ev.stopPropagation()
    refSlider.current?.slickPrev()
  }

  function onNext(ev: React.MouseEvent<HTMLButtonElement, MouseEvent>) {
    ev.stopPropagation()
    refSlider.current?.slickNext()
  }

  function beforeChange() {
    isChanging.current = true
  }

  function afterChange(currentSlide: number) {
    isChanging.current = false
    onChangeIndex(currentSlide)
  }

  function onClickImage(
    ev: React.MouseEvent<HTMLDivElement, MouseEvent>,
    index: number
  ) {
    ev.stopPropagation()

    if (index === currentIndex && !isChanging.current) {
      onViewGallery()
    }

    if (
      currentIndex - index === 1 ||
      (currentIndex === 0 && index === images.length - 1)
    )
      refSlider.current?.slickPrev()
    if (
      index - currentIndex === 1 ||
      (currentIndex === images.length - 1 && index === 0)
    )
      refSlider.current?.slickNext()
  }

  if (images.length === 0) {
    return (
      <div className='th-image-viewer'>
        <div className='th-no-image'>No Photos</div>
        <style jsx>{styles}</style>
      </div>
    )
  }

  return (
    <div className='th-image-viewer'>
      <Button className='th-prev-button' onClick={onPrev}>
        <SvgArrow />
      </Button>
      <Button className='th-next-button' onClick={onNext}>
        <SvgArrow />
      </Button>
      <Slider
        ref={refSlider}
        dots={false}
        initialSlide={currentIndex}
        infinite={true}
        centerMode={true}
        beforeChange={beforeChange}
        afterChange={afterChange}
        centerPadding={'10%'}
        responsive={[
          {
            breakpoint: 540,
            settings: {
              centerPadding: '0'
            }
          }
        ]}
      >
        {images.map((e: string, index: number) => (
          <div
            className='th-image'
            key={index}
            onClick={e => onClickImage(e, index)}
          >
            <img src={e} alt='' />
          </div>
        ))}
      </Slider>

      <div className='th-info-overlay' onClick={onViewGallery}>
        <div className='th-image-index'>
          {currentIndex + 1} / {images.length}
        </div>
        <Button className='th-view-gallery'>
          <SvgImage />
          <span className='ml-2'>View Gallery</span>
        </Button>
      </div>

      <style jsx>{styles}</style>
    </div>
  )
}

export default React.memo(ImageViewer)
