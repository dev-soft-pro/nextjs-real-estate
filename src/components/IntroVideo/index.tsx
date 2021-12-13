import React from 'react'
import YouTube from '@u-wave/react-youtube'
import { logEvent } from 'services/analytics'
import styles from './styles.scss?type=global'

const imgBaseUrl = '/images/landing'
export default function IntroVideo({
  eventCategory
}: {
  eventCategory: string
}) {
  const [introVideo, showIntroVideo] = React.useState(false)
  return (
    <div className='th-intro-video-wrapper'>
      {introVideo ? (
        <YouTube
          className='th-intro-video'
          width='100%'
          height='100%'
          video='Bjqqv5JOwro'
          allowFullscreen
          autoplay
          onEnd={() => logEvent(eventCategory, 'intro_video', 'end')}
          onPause={() => logEvent(eventCategory, 'intro_video', 'pause')}
          onPlaying={() => logEvent(eventCategory, 'intro_video', 'play')}
        />
      ) : (
        <>
          <img
            className='lazyload th-intro-video'
            data-sizes='(max-width: 375px) 340px, (max-width: 1440px) 560px, (max-width: 1520px) 600px, 700px'
            data-srcset={`${imgBaseUrl}/tophap-overview-video-680.jpg 680w, ${imgBaseUrl}/tophap-overview-video-1120.jpg 1120w, ${imgBaseUrl}/tophap-overview-video-1200.jpg 1200w, ${imgBaseUrl}/tophap-overview-video.jpg 1400w`}
            data-src={`${imgBaseUrl}/tophap-overview-video.jpg`}
            alt='Tophap Overview Video'
            onClick={() => showIntroVideo(true)}
          />
          <button className='th-ytp-button' aria-label='Play'>
            <svg height='100%' version='1.1' viewBox='0 0 68 48' width='100%'>
              <path
                className='ytp-large-play-button-bg'
                d='M66.52,7.74c-0.78-2.93-2.49-5.41-5.42-6.19C55.79,.13,34,0,34,0S12.21,.13,6.9,1.55 C3.97,2.33,2.27,4.81,1.48,7.74C0.06,13.05,0,24,0,24s0.06,10.95,1.48,16.26c0.78,2.93,2.49,5.41,5.42,6.19 C12.21,47.87,34,48,34,48s21.79-0.13,27.1-1.55c2.93-0.78,4.64-3.26,5.42-6.19C67.94,34.95,68,24,68,24S67.94,13.05,66.52,7.74z'
                fill='#212121'
                fillOpacity='0.8'
              />
              <path d='M 45,24 27,14 27,34' fill='#fff' />
            </svg>
          </button>
        </>
      )}
      <style jsx>{styles}</style>
    </div>
  )
}

IntroVideo.defaultProps = {
  eventCategory: 'landing'
}
