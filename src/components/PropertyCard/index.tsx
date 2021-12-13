import React, { useState, useEffect } from 'react'
import commaNumber from 'comma-number'
import copy from 'copy-to-clipboard'
import fetch from 'isomorphic-unfetch'

import Avatar from 'components/Avatar'
import Button from 'components/Button'
import Carousel from 'components/SwipableCarousel'
import Status from 'components/PropertyStatus'
import Snackbar from 'components/Snackbar'
import Tooltip from 'components/Tooltip'
import { googleMapKey } from 'configs'
import { accessToken } from 'configs/mapbox'
import { logEvent } from 'services/analytics'
import { getMedia } from 'services/properties'
import { useIsMounted } from 'utils/hook'
import { viewUrl } from 'utils/properties'

// import SvgHeart from 'assets/images/card/heart.svg'
import SvgMarker from 'assets/images/card/map-marker.svg'
import SvgCompare from 'assets/images/icons/compare.svg'
import SvgShare from 'assets/images/icons/share.svg'
// import SvgMail from 'assets/images/card/mail_outline.svg'
import styles from './styles.scss?type=global'

interface ItemInfoProps {
  comma?: boolean
  fixed?: number
  label: React.ReactNode
  value: number
}
export function ItemInfo({ comma, fixed, label, value }: ItemInfoProps) {
  return (
    <div className='th-property-info'>
      <div className='th-property-info-title'>{label}</div>
      <div className='th-property-info-value'>
        {isNaN(value)
          ? '-'
          : comma
          ? commaNumber(value.toFixed(fixed))
          : value.toFixed(fixed)}
      </div>
    </div>
  )
}

export interface PropertyCardProps {
  allDescription?: boolean
  autoPlay?: boolean
  isMobile: boolean
  isScrolling?: boolean
  // isVisible?: boolean
  item: TopHap.Property
  isFavorite?: boolean
  lazyload?: boolean
  mini?: boolean
  mlsLogo?: string
  rentalEstimate: boolean
  showLocation?(item: TopHap.Property): void
  toggleFavorite?(id: string): void
  compare?(item: TopHap.Property): void

  [eleName: string]: any
}

function PropertyCard({
  allDescription,
  autoPlay,
  isMobile,
  isScrolling,
  item,
  // isFavorite,
  lazyload,
  mini,
  mlsLogo,
  rentalEstimate,
  showLocation,
  // toggleFavorite,
  compare,
  ...props
}: PropertyCardProps) {
  const [images, setImages] = useState<string[]>([])
  const [count, setCount] = useState(0)
  const [imagesLoaded, setImagesLoaded] = useState(false)
  const isMounted = useIsMounted()

  useEffect(() => {
    async function setImageData() {
      const { media } = item

      if (media && media.photos && media.photos.length) {
        setImages(media.photos)
        setCount(media.count)
        setImagesLoaded(media.count === media.photos.length)
      } else {
        let images = []
        const status = await fetch(
          `https://maps.googleapis.com/maps/api/streetview/metadata?location=${item.location[1]},${item.location[0]}&key=${googleMapKey}`
        )
          .then(res => res.json())
          .then(res => res.status)
          .catch(console.log)

        if (status === 'OK') {
          images = [
            `https://maps.googleapis.com/maps/api/streetview?size=450x300&location=${item.location[1]},${item.location[0]}&key=${googleMapKey}`
          ]
        } else {
          images = [
            `https://api.mapbox.com/styles/v1/tophapinc/ck0jt2g8u0vle1cqjg7cw4nxc/static/${item.location[0]},${item.location[1]},18,0,0/640x480@2x?access_token=${accessToken}`
          ]
        }

        if (isMounted.current) {
          setImages(images)
          setCount(1)
          setImagesLoaded(true)
        }
      }
    }

    setImageData()
  }, [item, isMounted])

  function loadImages() {
    if (!lazyload) return
    const { media } = item

    if (imagesLoaded) return
    if (!media || !media.photos) return
    if (count === images.length) return

    setImagesLoaded(true)

    getMedia(item.id)
      .then(media => {
        if (isMounted.current) {
          setImages(media ? media.photos : [])
        }
      })
      .catch(console.error)

    logEvent('property_card', 'load_more_images', null, { id: item.id })
  }

  function onShare(ev: React.MouseEvent<HTMLButtonElement, MouseEvent>) {
    ev.stopPropagation()
    const url = window.location.origin + viewUrl(item.id, item.address)
    copy(url)
    Snackbar.show({ message: 'Link copied to clipboard.' })

    logEvent('property_card', 'share', null, { id: item.id, url })
  }

  // function onFavorite(ev: React.MouseEvent<HTMLButtonElement, MouseEvent>) {
  //   ev.stopPropagation()

  //   if (isFavorite) {
  //     logEvent('property_card', 'disfavorite', null, { id: item.id })
  //   } else {
  //     logEvent('property_card', 'favorite', null, { id: item.id })
  //   }

  //   if (toggleFavorite) {
  //     toggleFavorite(item.id)
  //   }
  // }

  function onCompare(ev: React.MouseEvent<HTMLButtonElement, MouseEvent>) {
    ev.stopPropagation()

    if (compare) compare(item)
    logEvent('property_card', 'compare', null, { id: item.id })
  }

  function onLocation(ev: React.MouseEvent<HTMLButtonElement, MouseEvent>) {
    ev.stopPropagation()

    if (showLocation) showLocation(item)
    logEvent('property_card', 'show_location', null, { id: item.id })
  }

  function _renderPrices() {
    const label = item.RentFlag
      ? 'Rental Price / Month'
      : item.TophapStatus === 'Sold'
      ? 'Sold Price'
      : 'List Price'

    if (!item.Price && !item.PricePerSqft) return null

    return (
      <div className='th-prices th-left'>
        <span className='th-price-type'>
          {label}
          {item.PreviousListPriceDiff ? (
            <Tooltip
              tooltip={
                item.OriginalListPriceDiff
                  ? `$${commaNumber(
                      Math.abs(item.OriginalListPriceDiff)
                    )} (with Original List Price)`
                  : undefined
              }
              trigger='hover'
            >
              &nbsp;(Price cut: $
              {commaNumber(Math.abs(item.PreviousListPriceDiff))})
            </Tooltip>
          ) : null}
        </span>
        <p className='th-price'>
          {item.Price ? (
            <span>${commaNumber(Math.round(item.Price))}</span>
          ) : (
            <span>&nbsp;</span>
          )}
        </p>
        <p className='th-pricepersqft'>
          {item.LivingSqft && item.PricePerSqft ? (
            <span>${commaNumber(Math.round(item.PricePerSqft))} / ft²</span>
          ) : (
            <span>&nbsp;</span>
          )}
        </p>
      </div>
    )
  }

  function _renderEstimates() {
    if (!item.estimates) return null

    const price = rentalEstimate
      ? item.estimates.rentEstimate
      : item.estimates.estimate
    const ppsf = rentalEstimate
      ? item.estimates.rentPpsqft
      : item.estimates.ppsqft
    const tooltipPrice = rentalEstimate
      ? item.estimates.estimate
      : item.estimates.rentEstimate

    const tooltip =
      tooltipPrice || item.estimates.rentYieldEstimate ? (
        <div>
          {tooltipPrice ? (
            <span className='d-flex justify-content-between'>
              <span className='mr-2'>
                {rentalEstimate
                  ? 'TopHap Value Estimate:'
                  : 'TopHap Rental Estimate:'}
              </span>
              <span>
                ${commaNumber(tooltipPrice)}
                {rentalEstimate ? '' : ' / month'}
              </span>
            </span>
          ) : null}
          {item.estimates.rentYieldEstimate ? (
            <span className='d-flex justify-content-between'>
              <span className='mr-2'>Estimated Rental Yield:</span>
              <span>{commaNumber(item.estimates.rentYieldEstimate)}%</span>
            </span>
          ) : null}
        </div>
      ) : null

    if (!price && !ppsf) return null

    return (
      <div className='th-prices th-right' style={{ pointerEvents: 'auto' }}>
        <Tooltip tooltip={tooltip} trigger='hover'>
          <span className='th-price-type'>
            {rentalEstimate ? 'Rental Estimate / Month' : 'TopHap Estimate'}
          </span>
          <p className='th-price'>
            {price ? (
              <span>${commaNumber(Math.round(price))}</span>
            ) : (
              <span>&nbsp;</span>
            )}
          </p>
          <p className='th-pricepersqft'>
            {item.LivingSqft && ppsf ? (
              <span>${commaNumber(Math.round(ppsf))} / ft²</span>
            ) : (
              <span>&nbsp;</span>
            )}
          </p>
        </Tooltip>
      </div>
    )
  }

  function _renderAgent() {
    const coListTooltip = item.Agents?.CoList ? (
      <div>
        <strong>{item.Agents.CoList.MemberFullName}</strong>
        <br />
        <small>{item.Agents.CoList.OfficeName}</small>
      </div>
    ) : null

    return (
      item.Agents && (
        <section className='th-agent-section'>
          <div className='th-agent-info' style={{ pointerEvents: 'auto' }}>
            <Tooltip tooltip={coListTooltip} trigger='hover' placement='right'>
              <p className='th-agent-name'>{item.Agents.List.MemberFullName}</p>
              <p className='th-agent-company'>{item.Agents.List.OfficeName}</p>
            </Tooltip>
          </div>
          <Avatar
            className='th-agent-avatar'
            name={item.Agents.List.MemberFullName}
          />
          {/* <Button className='th-contact-button'>
          <span>Contact Agent</span>
          <SvgMail />
        </Button> */}
        </section>
      )
    )
  }

  return (
    <div className='th-property-card' {...props}>
      <section className='th-main-section'>
        <Carousel
          autoPlay={autoPlay}
          count={count}
          images={images}
          isMobile={isMobile}
          isScrolling={isScrolling}
          onScroll={loadImages}
        />

        <div className='th-overlay'>
          <Status property={item} />

          {_renderAgent()}
          {_renderPrices()}
          {_renderEstimates()}
        </div>
      </section>

      <section className='th-info-section'>
        <div className='th-location-actions'>
          {mini || !showLocation ? null : (
            <Tooltip tooltip='Locate Property on Map' trigger='hover'>
              <Button className='th-location-button' onClick={onLocation}>
                <SvgMarker />
              </Button>
            </Tooltip>
          )}
          <div className='th-location'>
            <div className='th-address'>{item.displayAddress}</div>
            <div className='th-region'>{item.displayRegion}</div>
          </div>
          {!mini && (
            <div className='th-actions'>
              {/*<Button className='th-action-button' onClick={onFavorite}>
                <SvgHeart />
              </Button>*/}
              <Tooltip tooltip='Compare Property' trigger='hover'>
                <Button className='th-action-button' onClick={onCompare}>
                  <SvgCompare />
                </Button>
              </Tooltip>
              <Tooltip tooltip='Copy Link To Clipboard' trigger='hover'>
                <Button className='th-action-button' onClick={onShare}>
                  <SvgShare />
                </Button>
              </Tooltip>
            </div>
          )}
        </div>

        <div className='th-metrics'>
          <ItemInfo label='Bed' value={item.BedsCount} />
          <ItemInfo label='Bath' value={item.BathsDecimal} />
          <ItemInfo label='Sq Ft' value={Math.round(item.LivingSqft)} comma />
          <ItemInfo label='Lot Size' value={item.LotAcres} fixed={2} />
          <ItemInfo label='Cars' value={item.ParkingCount} />
          <ItemInfo label='Built' value={item.YearBuilt} />
          <ItemInfo label='Permits' value={item.permitsCount} />
          <ItemInfo label='DOM' value={item.DOM} />
        </div>

        {mini ? null : allDescription ? (
          <div className='th-description' style={{ height: '100%' }}>
            {item.PublicRemarks}
          </div>
        ) : (
          <Tooltip tooltip={item.PublicRemarks} trigger='hover'>
            <div className='th-description' style={{ cursor: 'pointer' }}>
              {item.PublicRemarks}

              <div className='th-more'>Read More</div>
            </div>
          </Tooltip>
        )}

        {!mini && mlsLogo && (
          <img className='th-mls-logo' src={mlsLogo} alt={item.mls} />
        )}
      </section>

      <style jsx>{styles}</style>
    </div>
  )
}

export default React.memo(PropertyCard)
