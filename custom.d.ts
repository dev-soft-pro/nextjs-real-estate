declare module '*.svg'
declare module '*.png'
declare module '*.jpg'

declare module '*.css'
declare module '*.scss'
declare module '*.scss?type=global'
declare module '*.scss?type=resolve'

declare module 'react-input-range'
declare module 'react-responsive-pinch-zoom-pan'
declare module 'react-user-avatar'
declare module 'react-intercom/src'
declare module 'comma-number'
declare module 'get-video-id'
declare module 'h3-js'
declare module 'number-abbreviate'
declare module 'ramda.path'
declare module 'react-scroll-sync'
declare module '@mapbox/mapbox-gl-draw'

declare module 'react-google-map-street-view' {
  export interface StreetViewProps {
    address: string
    APIkey: string
    streetView: boolean
    zoomLevel: number
    mapStyle: any
  }

  const StreetView: React.ComponentClass<StreetViewProps>
  export { StreetView }
}