import { memo, useEffect, useRef, useState } from 'react'
import { LazyImage } from 'react-lazy-images'
import cn from 'classnames'
import debounce from 'lodash/debounce'
import smoothScroll from 'smoothscroll-polyfill'

import SvgArrow from 'assets/images/carousel/arrow-forward.svg'
import SvgImage from 'assets/images/carousel/no-image.svg'

import styles from './styles.scss?type=global'

if (typeof window !== 'undefined') {
  smoothScroll.polyfill()
}

interface SwipableCarouselProps {
  autoPlay?: boolean
  count: number
  forceHttps: boolean
  images: any[]
  isMobile: boolean
  isScrolling: boolean
  onClick?(e: any): void
  onScroll?(e: React.UIEvent<HTMLDivElement>): void
}

function SwipableCarousel({
  autoPlay,
  count,
  forceHttps,
  images,
  isMobile,
  isScrolling,
  onClick,
  ...props
}: SwipableCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [playCount, setPlayCount] = useState(0)
  const refContainer = useRef<HTMLDivElement>(null)
  const imageLoaded = useRef<boolean[]>([])

  useEffect(() => {
    if (autoPlay) {
      const timer = setInterval(onAutoPlay, 1000)

      return () => {
        if (timer) {
          clearInterval(timer)
        }
      }
    }
  }, [])

  useEffect(() => {
    if (autoPlay) {
      for (let i = 0; i < count; ++i) {
        imageLoaded.current[i] = false
      }
    }
  }, [count, autoPlay])

  useEffect(() => {
    if (playCount % 2 === 0) {
      // every 2s
      if (currentIndex === images.length - 1) {
        moveTo(0, 'auto')
      } else {
        if (imageLoaded.current[currentIndex + 1]) onNext()
      }
    }
  }, [playCount])

  function onAutoPlay() {
    setPlayCount(prev => prev + 1)
  }

  function moveTo(
    index: number,
    behavior: ScrollOptions['behavior'] = 'smooth'
  ) {
    if (!refContainer.current) return

    refContainer.current.scrollTo({
      left: index * refContainer.current.clientWidth,
      behavior
    })
  }

  function onPrev(e?: React.MouseEvent<HTMLDivElement, MouseEvent>) {
    if (e) {
      e.preventDefault()
      e.stopPropagation()
    }

    moveTo(Math.max(currentIndex - 1, 0))
  }

  function onNext(e?: React.MouseEvent<HTMLDivElement, MouseEvent>) {
    if (e) {
      e.preventDefault()
      e.stopPropagation()
    }

    moveTo(Math.min(currentIndex + 1, count - 1))
  }

  function onImageLoad(index: number) {
    imageLoaded.current[index] = true

    if (index === currentIndex + 1) {
      if (playCount % 2) setPlayCount(prev => prev + 1)
    }
  }

  const handleScrollEnd = debounce(() => {
    if (!refContainer.current) return

    setCurrentIndex(
      Math.round(
        refContainer.current.scrollLeft / refContainer.current.clientWidth
      )
    )
  }, 100)

  function onScroll(e: React.UIEvent<HTMLDivElement>) {
    handleScrollEnd()

    if (props.onScroll) props.onScroll(e)
  }

  const items = []
  for (let i = 0; i < count; ++i) {
    items[i] = images[i]
    if (items[i] && forceHttps) {
      items[i] = items[i].replace('http:', 'https:')
    }
  }

  return (
    <div
      className={cn('th-swipable-carousel-container', {
        'th-mobile': isMobile
      })}
      onScroll={onScroll}
      onClick={onClick}
    >
      <div
        className='th-swipable-carousel'
        ref={refContainer}
        style={{ overflow: isMobile ? 'auto' : 'hidden' }}
      >
        {items.length ? (
          items.map((item, index) => (
            <LazyImage
              loadEagerly={
                autoPlay &&
                index <= Math.min(currentIndex + 1, items.length - 1)
              }
              src={item}
              alt=''
              key={index}
              debounceDurationMs={isScrolling ? 100 : undefined}
              placeholder={({ ref }) => (
                <div className='th-image-container th-placeholder' ref={ref}>
                  <SvgImage className='th-icon' />
                </div>
              )}
              actual={({ imageProps }) => (
                <div className='th-image-container'>
                  {/* eslint-disable-next-line */}
                  <img
                    className='th-image'
                    {...imageProps}
                    onLoad={autoPlay ? () => onImageLoad(index) : undefined}
                  />
                </div>
              )}
              observerProps={{
                rootMargin: '10px 1000px',
                threshold: 0
              }}
            />
          ))
        ) : (
          <div className='th-image-container' />
        )}
      </div>

      <div className='th-carousel-actions'>
        <div onClick={onPrev}>
          <SvgArrow
            className={cn('th-action-left', {
              'th-disabled': currentIndex <= 0
            })}
          />
        </div>
        <div onClick={onNext}>
          <SvgArrow
            className={cn('th-action-right', {
              'th-disabled': currentIndex >= count - 1
            })}
          />
        </div>
      </div>

      <style jsx>{styles}</style>
    </div>
  )
}

SwipableCarousel.defaultProps = {
  isScrolling: false,
  isMobile: false,
  forceHttps: true
}

export default memo(SwipableCarousel)
