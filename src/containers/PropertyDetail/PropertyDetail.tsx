import React from 'react'
import ResizeDetector from 'react-resize-detector'
import cn from 'classnames'
import fetch from 'isomorphic-unfetch'
import get from 'lodash/get'
import getVideoId from 'get-video-id'
import dynamic from 'next/dynamic'
import Head from 'next/head'
import Router from 'next/router'
import 'lazysizes'
import smoothScroll from 'smoothscroll-polyfill'
import { circle, Feature, Polygon } from '@turf/turf'

import RequestInfo from 'components/RequestInfo'
import OverlaySpinner from 'components/OverlaySpinner'
import CircleSpinner from 'components/OverlaySpinner/Spinners/Circle'
import { BREAK_XS, BREAK_SM, BREAK_MD, BREAK_LG, BREAK_XL } from 'consts'
import { PROPERTY_DETAIL_PAGE } from 'consts/url'
import { targetDates, estimate, logPerform } from 'services/estimates'
import {
  estimateForCompare,
  getDetail,
  getMedia,
  get as getProperty
} from 'services/properties'
import { normalize } from 'utils/properties'
import { viewUrl } from 'utils/properties'
import { previewUrl } from 'utils/url'
import { logEvent } from 'services/analytics'

import CollapsablePanel from './components/CollapsablePanel'
import History from './components/History'
import ImprovementsCard from './components/ImprovementsCard'
import InformationTable from './components/InformationTable'
import MainSectionDesktop from './components/MainSectionDesktop'
import MobileCard from './components/MobileCard'
import MLS from './components/MLS'
import NavBar from './components/NavBar'
import NearbyStatistics from './components/NearbyStatistics'
import Overview from './components/Overview'
import OverviewHeader from './components/OverviewHeader'
import PageHeader from './components/PageHeader'
import PublicRecords from './components/PublicRecords'
import ValuationCard from './components/ValuationCard'
import Views from './components/Views'
import ViewTypes, { ViewType } from './components/ViewTypes'
import styles from './styles.scss?type=global'
import { PageContext } from 'types/app'

const Comparables = dynamic(() => import('./components/Comparables'), {
  ssr: false
})
const ImageGallery = dynamic(() => import('./components/ImageGallery'), {
  ssr: false
})

if (typeof window !== 'undefined') {
  smoothScroll.polyfill()
}

interface PropertyDetailProps {
  authenticated: boolean
  containerId?: string
  detail: TopHap.PropertiesState['detail']
  estimatesByRadius: TopHap.PropertiesState['estimatesByRadius']
  id: string
  isMobile: boolean
  mapStyle: TopHap.GlobalState['customerOptions']['mapStyle']
  mls: TopHap.PropertiesState['mls']
  mode: 'Page' | 'Component'
  source?: {
    property: TopHap.PropertySource
    media?: TopHap.PropertyMedia
  }
  viewportWidth: number
  addRecentView: TopHap.UserCreators['addRecentView']
  estimateByRadius: TopHap.PropertiesCreators['estimateByRadius']
  getMlsInfo: TopHap.PropertiesCreators['getMlsInfo']
  onBack?(): void
  setMapOption: TopHap.PreferencesCreators['setMapOption']
  updateDetail: (
    detail: Partial<TopHap.PropertiesState['detail']>,
    update?: boolean
  ) => void
  updateSider: TopHap.UICreators['updateSider']
}

interface PropertyDetailState {
  improvementCondition: number
  estimated?: any
  estimates: any[]
  estEnabled: boolean
  media?: TopHap.PropertyMedia
  photoViewOpened: boolean
  history?: TopHap.PropertyHistory[]
  source?: {
    normalized: TopHap.Property
    property: TopHap.PropertySource
    shape: Feature<Polygon>
    tourUrl?: string
  }
  target: any
  viewType: ViewType
  width: number
}

export default class PropertyDetail extends React.Component<
  PropertyDetailProps,
  PropertyDetailState
> {
  static defaultProps: Partial<PropertyDetailProps> = {
    mode: 'Page'
  }

  static async getInitialProps({ query, req, store }: PageContext) {
    if (!req) {
      const state: TopHap.StoreState = store.getState()
      if (state.properties.detail) {
        if (state.properties.detail.property._id === query.id) {
          return { source: state.properties.detail, id: query.id }
        }
      }

      return { id: query.id }
    } else {
      const id = query.id as string
      const [property, media] = await PropertyDetail.fetchSource(id)

      return {
        source: { property, media },
        id: query.id
      }
    }
  }

  static fetchSource(id: string) {
    return Promise.all([getProperty(id), getMedia(id)])
  }

  basePrices?: {
    [date: string]: {
      median: number
      count: number
    }
  }
  estData?: any
  mounted = false
  normalizedUrl = ''
  meta: any
  fetchingHistory?: boolean
  fetchingEstimate?: boolean

  constructor(props: PropertyDetailProps) {
    super(props)

    this.state = {
      improvementCondition: 50,
      viewType: 'Photo',
      width: props.mode === 'Page' ? props.viewportWidth : BREAK_SM,
      target: {},
      media: undefined,
      estimates: [],
      estimated: {},
      estEnabled: false,
      photoViewOpened: false
    }

    if (props.source) {
      const source = this.updateSource(
        props.source.property,
        props.source.media,
        true
      )
      this.state = {
        ...this.state,
        ...source
      }
    }
  }

  async componentDidMount() {
    this.mounted = true

    if (!this.props.source) {
      const id = this.props.id
      const { detail } = this.props
      if (detail && detail.property._id === id) {
        this.updateSource(detail.property, detail.media)
      } else {
        const res = await PropertyDetail.fetchSource(id)
        this.updateSource(res[0] as TopHap.PropertySource, res[1])
      }
    } else {
      this.normalizeUrl()
    }
  }

  async componentDidUpdate(prev: PropertyDetailProps) {
    if (prev.estimatesByRadius !== this.props.estimatesByRadius) {
      this._calcValuation()
    }

    if (prev.id !== this.props.id) {
      if (this.props.source) {
        this.updateSource(this.props.source.property, this.props.source.media)
      } else {
        const id = this.props.id as string
        const res = await PropertyDetail.fetchSource(id)
        this.updateSource(res[0] as TopHap.PropertySource, res[1])
      }
    }
  }

  componentWillUnmount() {
    this.mounted = false

    if (this.state.source) {
      this.props.updateSider(
        'properties',
        { id: this.state.source.normalized.id },
        true
      )
    }
  }

  normalizeUrl = () => {
    // normalize url if needed
    if (
      Router.pathname === PROPERTY_DETAIL_PAGE &&
      Router.asPath !== this.normalizedUrl
    ) {
      Router.replace(PROPERTY_DETAIL_PAGE, this.normalizedUrl, {
        shallow: true
      })
    }
  }

  _calcValuation = () => {
    if (this.basePrices && this.basePrices.last && this.state.source) {
      const target = this.prepareEstimate(
        this.state.source.normalized,
        this.state.source.property
      )
      this.calcValuation(target)
    } else {
      setTimeout(this._calcValuation, 100)
    }
  }

  updateSource = (
    property: TopHap.PropertySource,
    media?: TopHap.PropertyMedia,
    init?: boolean
  ) => {
    // update properties.detail
    const { detail } = this.props
    const reuse = detail && detail.property._id === property._id
    if (!reuse) {
      this.props.updateDetail({ property, media })
    }

    // extract necesssary data
    const normalized = normalize(property, 'detail')
    const shape = circle(normalized.location, 1)
    const tourUrl = this.getTourUrl(property)

    if (media && media.photos.length) {
      if (media.photos.length === 1 && media.count > 1) {
        media.photos = [media.photos[0]]
        media.count = 1
      }
      media.photos = media.photos.map(e => e.replace('http:', 'https:'))
    }

    this.getBasePrices(normalized)

    if (normalized.mls && !this.props.mls[normalized.mls]) {
      this.props.getMlsInfo(normalized.mls)
    }

    let estEnabled = false
    if (property._source.estimates) {
      if (
        normalized.TophapStatus === 'Sold' ||
        Math.abs(normalized.Price - +property._source.estimates.estimate) <
          normalized.Price * 0.1
      ) {
        estEnabled = true
      }
    }

    const state = {
      estEnabled,
      source: {
        normalized,
        property,
        shape,
        tourUrl
      },
      media,
      viewType: (media && media.count ? 'Photo' : 'Street') as ViewType
    }

    if (reuse) {
      this._calcValuation()
    } else {
      this.props.estimateByRadius({
        location: {
          lon: normalized.location[0],
          lat: normalized.location[1]
        },
        radius: 1
      })

      this.props.addRecentView(this.props.id)
    }

    this.normalizedUrl = viewUrl(normalized.id, normalized.address)

    // information for meta tags
    this.meta = {
      title: `${normalized.displayAddress}, ${normalized.displayRegion} | TopHap`,
      description:
        (normalized.BedsCount ? `Bedrooms: ${normalized.BedsCount}, ` : '') +
        (normalized.BathsDecimal
          ? `Bathrooms: ${normalized.BathsDecimal}, `
          : '') +
        (normalized.LivingSqft
          ? `Living Area: ${normalized.LivingSqft} ft², `
          : '') +
        (normalized.LotAcres
          ? `Lot Size: ${normalized.LotAcres} acres, `
          : '') +
        (normalized.ParkingCount
          ? `Garage Spaces: ${normalized.ParkingCount}, `
          : '') +
        (normalized.YearBuilt ? `Year Built: ${normalized.YearBuilt}, ` : '') +
        (normalized.permitsCount ? `Permits: ${normalized.permitsCount}` : ''),
      image: `https://preview.tophap.com/property/${normalized.id}`,
      url: this.normalizedUrl
    }

    if (!init) {
      if (this.mounted) {
        this.setState(state)

        this.normalizeUrl()
      }
    }

    return state
  }

  fetchHistory = async () => {
    if (!get(this.props.detail, 'history') && !this.fetchingHistory) {
      this.fetchingHistory = true
      const history = await getDetail({
        attomId: this.props.id,
        sort: 'desc',
        withTypes: true,
        types: ['Listing', 'Deed', 'Permit', 'Tax']
      })
      this.fetchingHistory = false
      this.props.updateDetail({ history }, true)
    }
  }

  fetchEstimate = async () => {
    if (!get(this.props.detail, 'estimates') && !this.fetchingEstimate) {
      this.fetchingEstimate = true
      const estimates = await estimateForCompare({
        h3: 7,
        properties: [this.props.id]
      }).then(res => {
        return res.property[this.props.id].month.buckets.map((e: any) => ({
          key: e.key,
          date: e.key_as_string,
          price: get(e, 'estimate_price.value')
        }))
      })
      this.fetchingEstimate = false
      this.props.updateDetail({ estimates }, true)
    }
  }

  fetchHistoryAndEstimate = () => {
    this.fetchHistory()
    this.fetchEstimate()
  }

  getBasePrices = (property: TopHap.Property) => {
    const file = `${property.address.CountyOrParish.toLowerCase().replace(
      / /g,
      ''
    )}-base-prices.json`
    fetch(
      `https://s3-us-west-2.amazonaws.com/tophap-assets/base-price-cache-all-counties/${file}`
    )
      .then(function(response) {
        if (response.status >= 400) {
          throw new Error('Bad response from server')
        }
        return response.json()
      })
      .then(res => {
        this.basePrices = res
      })
      .catch(console.error)
  }

  getBasePrice = (targetTime: number | string) => {
    const base = this.basePrices as any
    const date = new Date(targetTime).toISOString().substr(0, 10)
    if (base.hasOwnProperty(date)) {
      return base[date].median
    }

    return base['last'].median
  }

  prepareEstimate = (
    normalized: TopHap.Property,
    property: TopHap.PropertySource
  ) => {
    if (!this.state.source) return

    const { estimatesByRadius } = this.props

    this.estData = estimatesByRadius.map(e => {
      const { address, Facts, estimates, locations } = e._source
      return {
        Address: address.UnparsedAddress,
        City: address.City,
        BedroomsTotal: Number(Facts.BedsCount),
        BathroomsFull: Number(Facts.BathsDecimal),
        LivingArea: Number(Facts.LivingSqft),
        ClosePricePerSqft: Number(Facts.TransactionAmountPerSqft),
        CloseDate: Facts.TransactionDate,
        time: new Date(Facts.TransactionDate).getTime(),
        Month:
          Number(Facts.TransactionDate.substring(0, 4)) * 12 +
          Number(Facts.TransactionDate.substring(5, 7)),
        Stories: Number(Facts.StoriesCount),
        YearBuilt: Number(Facts.YearBuilt),
        lat: Number(locations.parcelLocation.lat),
        lon: Number(locations.parcelLocation.lon),
        Use: '"' + Facts.PropertyUse + '"',
        LotSizeAcres: Number(Facts.LotAcres),
        ATTOMID: Number(e._id),
        Zip: address.PostalCode,
        trusted: Number(estimates.trusted),
        perform: Number(estimates.perform)
      }
    })

    const target: any = {
      ClosePricePerSqft: Number(normalized.TransactionAmountPerSqft),
      ClosePrice:
        Number(normalized.TransactionAmountPerSqft) * normalized.LivingSqft,
      CloseDate: normalized.TransactionDate,
      BedroomsTotal: normalized.BedsCount,
      BathroomsFull: normalized.BathsDecimal,
      LivingArea: normalized.LivingSqft,
      time: new Date(normalized.TransactionDate).getTime(),
      Month:
        Number(normalized.TransactionDate.substring(0, 4)) * 12 +
        Number(normalized.TransactionDate.substring(5, 7)),
      Stories: Number(normalized.StoriesCount),
      YearBuilt: normalized.YearBuilt,
      Use: '"' + normalized.PropertyUse + '"',
      lat: normalized.location[1],
      lon: normalized.location[0],
      LotSizeAcres: normalized.LotAcres,
      Zip: normalized.address.PostalCode
    }

    let targetBasePrice = null
    const lastSoldTime = new Date(target.CloseDate).getTime()
    targetBasePrice = lastSoldTime > 0 ? this.getBasePrice(lastSoldTime) : 0

    // need to get baseprice only
    if (
      target.ClosePricePerSqft &&
      targetBasePrice &&
      lastSoldTime >= new Date('2014-01-01').getTime()
    ) {
      // target.perform = logPerform(target.ClosePricePerSqft / targetBasePrice)
      target.trust = 1
      target.basePerform = logPerform(
        target.ClosePricePerSqft / targetBasePrice
      )
      target.perform =
        target.basePerform * ((this.state.improvementCondition + 50) / 100)
    } else if (property._source.estimates) {
      // doublecheck if calcuating latest perform is correct
      target.basePerform = logPerform(
        Number(property._source.estimates.ppsqft) /
          this.getBasePrice(targetDates[targetDates.length - 1])
      )
      target.perform = 0
    }

    if (Number(target.ClosePrice) === 0) {
      delete target.ClosePrice
      delete target.ClosePricePerSqft
      delete target.CloseDate
      delete target.perform
    }

    this.setState({ target })

    return target
  }

  calcValuation = (target: any) => {
    const estimates = targetDates.map(e => ({
      ...estimate(
        this.estData,
        { ...target, time: new Date(e).getTime() },
        -1,
        this.getBasePrice(new Date(e).getTime())
      ),
      ...{ date: e }
    }))

    this.setState({
      estimates,
      estimated: estimates.length ? estimates[estimates.length - 1] : {}
    })
  }

  getTourUrl = (property: TopHap.PropertySource): string | undefined => {
    const urls = [
      get(property, '_source.rets.VirtualTourURLBranded'),
      get(property, '_source.rets.VirtualTourURLUnbranded')
    ].flat()
    let tourUrl

    for (let i = 0; i < urls.length; ++i) {
      if (urls[i]) {
        tourUrl = urls[i]
        tourUrl = tourUrl.split(' ')[0]

        if (!tourUrl.startsWith('http')) {
          tourUrl = `https://${tourUrl}`
        }

        if (tourUrl.includes('matterport.com')) {
          return tourUrl.replace('http:', 'https:')
        } else {
          const video = getVideoId(tourUrl)

          if (video.service === 'youtube') {
            if (video.id) {
              return `https://www.youtube.com/embed/${video.id}?autoplay=1&loop=1&controls=0`
            }
          } else if (video.service === 'vimeo') {
            if (video.id) {
              return `https://player.vimeo.com/video/${video.id}`
            }
          } else {
            tourUrl = ''
          }
        }
      }
    }

    return tourUrl
  }

  togglePhotoView = () => {
    this.setState(prevState => ({
      photoViewOpened: !prevState.photoViewOpened
    }))
  }

  onResize = (width: number) => {
    this.setState({ width })
  }

  onViewType = (viewType: ViewType) => {
    this.setState({ viewType })

    const normalized = this.state.source?.normalized as TopHap.Property
    logEvent('property_detail', 'view_type', viewType.toLowerCase(), {
      id: normalized.id
    })
  }

  onChangeTarget = (target: any, improvementCondition: number) => {
    let sign = 1
    if (improvementCondition < 50) sign = -1
    const estimated = estimate(
      this.estData,
      {
        ...target,
        time: new Date(targetDates[targetDates.length - 1]).getTime(),
        perform:
          improvementCondition === 50
            ? target.trust === 1
              ? target.basePerform
              : 0
            : target.basePerform +
              sign *
                Math.abs(
                  target.basePerform * ((improvementCondition + 50) / 100)
                )
      },
      -1,
      this.getBasePrice(targetDates[targetDates.length - 1])
    )

    this.setState({ target, estimated, improvementCondition })
  }

  showLocation = (property: TopHap.Property) => {
    this.props.setMapOption(
      'viewport',
      {
        center: property.location,
        zoom: 18,
        updatedBy: 'USER'
      },
      true
    )
  }

  render() {
    const {
      authenticated,
      containerId,
      detail,
      id,
      isMobile,
      mapStyle,
      mls,
      mode,
      viewportWidth
    } = this.props

    if (!this.state.source || this.state.source.property._id !== id)
      return (
        <div className='th-property-detail'>
          <OverlaySpinner absolute visible />
        </div>
      )

    const history = get(detail, 'history')
    const estimatesHistory = get(detail, 'estimates')

    const {
      estimated,
      estimates,
      estEnabled,
      improvementCondition,
      media,
      photoViewOpened,
      source: { property, normalized, shape, tourUrl },
      target,
      viewType,
      width
    } = this.state

    const _viewTypes = (
      <ViewTypes
        viewType={viewType}
        onChange={this.onViewType}
        map
        tour={!!tourUrl}
      />
    )

    const _views = (
      <Views
        isMobile={isMobile}
        mapStyle={mapStyle.satellite}
        property={normalized}
        shape={shape}
        tourUrl={tourUrl}
        viewType={viewType}
        width={width}
        media={media}
        togglePhotoView={this.togglePhotoView}
      />
    )

    const _cards = estEnabled && property._source.estimates && (
      <>
        <div className='th-card'>
          <ValuationCard
            estimates={estimates}
            latest={property._source.estimates}
            property={normalized}
          />
        </div>
        <div className='th-card'>
          <ImprovementsCard
            target={target}
            estimate={estimated}
            onChangeTarget={this.onChangeTarget}
            valuation={property._source.estimates}
            improvementCondition={improvementCondition}
          />
        </div>
      </>
    )

    return (
      <>
        <Head>
          <title key='title'>{this.meta.title}</title>
          <meta
            name='description'
            content={this.meta.description}
            key='description'
          />
          <meta name='thumbnail' content={this.meta.image} key='thumbnail' />

          <meta
            property='og:description'
            content={this.meta.description}
            key='og:description'
          />
          <meta property='og:image' content={this.meta.image} key='og:image' />
          <meta property='og:title' content={this.meta.title} key='og:title' />
          <meta property='og:url' content={this.meta.url} key='og:url' />

          <meta
            name='twitter:description'
            content={this.meta.description}
            key='twitter:description'
          />
          <meta
            name='twitter:image'
            content={this.meta.image}
            key='twitter:image'
          />
          <meta
            name='twitter:title'
            content={this.meta.title}
            key='twitter:title'
          />

          <link rel='canonical' href={this.meta.url} key='canonical' />
        </Head>
        <div
          className={cn(
            'th-property-detail',
            { 'th-page-mode': mode === 'Page' },
            {
              'th-break-xl': width <= BREAK_XL
            },
            {
              'th-break-lg': width <= BREAK_LG
            },
            {
              'th-break-md': width <= BREAK_MD
            },
            {
              'th-break-sm': width <= BREAK_SM
            },
            {
              'th-break-xs': width <= BREAK_XS
            }
          )}
        >
          {mode === 'Page' && <PageHeader />}
          <OverviewHeader
            property={normalized}
            onBack={
              mode === 'Component' && viewportWidth > BREAK_SM
                ? this.props.onBack
                : undefined
            }
            showLocation={mode === 'Page' ? undefined : this.showLocation}
          />

          {width <= BREAK_SM ? (
            <MobileCard
              property={normalized}
              viewSelectors={_viewTypes}
              views={_views}
            />
          ) : (
            <div className='th-views-wrapper'>
              {_views}
              {_viewTypes}
            </div>
          )}

          <NavBar containerId={containerId} />

          <div className='container th-page-content'>
            <div className='th-main-content'>
              {width > BREAK_SM && <MainSectionDesktop property={normalized} />}

              <CollapsablePanel id='overview' title='Overview' defaultExpanded>
                <section className='th-map-image-section'>
                  <img
                    className='lazyload'
                    src={previewUrl(
                      normalized.address.FullAddress,
                      normalized.location
                    )}
                  />
                </section>
                <Overview mls={mls} property={normalized} />
              </CollapsablePanel>

              {width <= BREAK_LG && _cards}

              <CollapsablePanel
                id='information_table'
                title='Listing Details'
                onExpand={this.fetchHistory}
              >
                {history ? (
                  <InformationTable property={property} history={history} />
                ) : (
                  <CircleSpinner className='mt-3 mb-4' size={24} />
                )}
              </CollapsablePanel>

              <CollapsablePanel
                id='relevant_properties'
                title='Relevant Properties'
                lazyload
              >
                <Comparables
                  mapStyle={mapStyle.satellite}
                  property={normalized}
                  others={estimated.references}
                />
              </CollapsablePanel>

              <CollapsablePanel
                id='nearby_property_statistics'
                title='Nearby Property Statistics'
                defaultExpanded
              >
                <NearbyStatistics
                  property={normalized}
                  shape={shape.geometry}
                  zones={property._source.zones}
                />
              </CollapsablePanel>

              <CollapsablePanel
                id='public_records'
                title='Public Records'
                onExpand={this.fetchHistory}
              >
                {history ? (
                  <PublicRecords
                    authenticated={authenticated}
                    history={history}
                  />
                ) : (
                  <CircleSpinner className='mt-3 mb-4' size={24} />
                )}
              </CollapsablePanel>

              <CollapsablePanel
                id='property_history'
                title='Property History'
                onExpand={this.fetchHistoryAndEstimate}
              >
                {history && estimatesHistory ? (
                  <History history={history} estimates={estimatesHistory} />
                ) : (
                  <CircleSpinner className='mt-3 mb-4' size={24} />
                )}
              </CollapsablePanel>

              <CollapsablePanel title='Contact an Agent' defaultExpanded>
                <RequestInfo property={normalized} small={width <= BREAK_XL} />
              </CollapsablePanel>

              {normalized.mls && mls[normalized.mls] && (
                <MLS mls={mls[normalized.mls]} />
              )}
            </div>

            {width > BREAK_LG && (
              <div className='th-right-content'>{_cards}</div>
            )}
          </div>

          {photoViewOpened && media && media.photos.length && (
            <ImageGallery
              visible={photoViewOpened}
              images={media.photos}
              toggle={this.togglePhotoView}
            />
          )}

          <ResizeDetector handleWidth onResize={this.onResize} />
          <style jsx>{styles}</style>
        </div>
      </>
    )
  }
}
