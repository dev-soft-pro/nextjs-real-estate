import React from 'react'
import dynamic from 'next/dynamic'
import Head from 'next/head'
import { useRouter } from 'next/router'
import SearchBar from './SearchBar'
import Sider from './Sider'
import MapOverlays from './Overlays'
import MobileControlPanel from './components/MobileControlPanel'

import { host } from 'configs'
import { BREAK_SM } from 'consts'
import styles from './styles.scss?type=global'

const Map = dynamic(() => import('./Map'), { ssr: false })

interface MapViewProps {
  isSiderVisible: boolean
  viewportWidth: number
  updateSider: TopHap.UICreators['updateSider']
}

export default function MapView({
  isSiderVisible,
  viewportWidth,
  updateSider
}: MapViewProps) {
  const router = useRouter()

  React.useEffect(() => {
    document.body.classList.add('th-mapview-showed')
    return () => {
      return document.body.classList.remove('th-mapview-showed')
    }
  }, [])

  const meta = {
    title: 'TopHap | Map',
    image:
      router.query.params && router.query.params[0]
        ? `https://preview.tophap.com/map/800/800/${encodeURIComponent(
            (router.query.params as string[]).join('/')
          )}`
        : undefined
  }

  return (
    <>
      <Head>
        <title key='title'>{meta.title}</title>

        {meta.image && (
          <meta property='og:image' content={meta.image} key='og:image' />
        )}
        <meta name='robots' content='noindex, nofollow' key='robots' />
        <meta property='og:title' content={meta.title} key='og:title' />
        <meta property='og:url' content={host + router.asPath} key='og:url' />

        {meta.image && (
          <meta name='twitter:image' content={meta.image} key='twitter:image' />
        )}
        <meta name='twitter:title' content={meta.title} key='twitter:title' />
      </Head>

      <div className='th-mapview'>
        <SearchBar />
        <Sider />

        <section className='th-map-container'>
          <Map />
          <MapOverlays mobile={viewportWidth <= BREAK_SM} />
        </section>
        {viewportWidth <= BREAK_SM && (
          <MobileControlPanel
            isSiderVisible={isSiderVisible}
            updateSider={updateSider}
          />
        )}
        <style jsx>{styles}</style>
      </div>
    </>
  )
}
