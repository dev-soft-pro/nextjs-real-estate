import { memo, useContext, useMemo } from 'react'
import capitalize from 'capitalize'
import commaNumber from 'comma-number'
import { useRouter } from 'next/router'
import { ReactReduxContext } from 'react-redux'
import copy from 'copy-to-clipboard'

import Breadcrumb from 'components/Breadcrumb'
import Button from 'components/Button'
import Link from 'components/Link'
import Status from 'components/PropertyStatus'
import { ItemInfo } from 'components/PropertyCard'
import Snackbar from 'components/Snackbar'
import { MAP_PAGE } from 'consts/url'
import { viewUrl } from 'utils/properties'
import { state2Hash, hash2MapUrl } from 'utils/url'
import { logEvent } from 'services/analytics'

import SvgFavorite from 'assets/images/card/heart.svg'
import SvgFavoriteBorder from 'assets/images/card/heart.svg'
import SvgMarker from 'assets/images/card/map-marker.svg'
import SvgShare from 'assets/images/icons/share.svg'
import SvgArrowBack from 'assets/images/icons/arrow-back.svg'
import SvgFullscreen from 'assets/images/card/expand.svg'
import SvgLogo from 'assets/images/logos/app-icon.svg'
import styles from './styles.scss?type=global'

interface OverviewHeaderProps {
  property: TopHap.Property
  onBack?(): void
  showLocation?(item: TopHap.Property): void
}

function OverviewHeader({
  property,
  onBack,
  showLocation
}: OverviewHeaderProps) {
  const router = useRouter()
  const context = useContext(ReactReduxContext)

  const region = useMemo(() => {
    return {
      state: property.address.StateOrProvince,
      county: `${capitalize.words(property.address.CountyOrParish)} County`,
      city: capitalize.words(property.address.City),
      address: property.displayAddress,
      postalCode: property.address.PostalCode
    }
  }, [property])

  function stateLink() {
    const store: TopHap.StoreState = context.store.getState()
    const hash = state2Hash(store)
    // CONSIDER: set CA while we have only CA
    hash.k = ''
    hash.m = { c: [-119.68, 36.640000000000015], z: 4.7, p: 0, b: 0 }
    return hash2MapUrl(hash)
  }

  function regionLink(keyword: string[]) {
    const store: TopHap.StoreState = context.store.getState()
    const hash = state2Hash(store)

    if (keyword.length > 2) {
      // when the last one is zip code
      hash.k =
        keyword.slice(0, keyword.length - 1).join(', ') +
        ' ' +
        keyword[keyword.length - 1]
    } else {
      hash.k = keyword.join(', ')
    }

    return hash2MapUrl(hash)
  }

  // TODO: favorite
  const isFavorite = false
  function toggleFavorite() {
    if (isFavorite) {
      logEvent('property_detail', 'disfavorite', null, { id: property.id })
    } else {
      logEvent('property_detail', 'favorite', null, { id: property.id })
    }
  }

  function onShare() {
    const url = window.location.origin + viewUrl(property.id, property.address)
    copy(url)
    Snackbar.show({ message: 'Link copied to clipboard.' })

    logEvent('property_detail', 'share', null, { id: property.id, url })
  }

  function onExpand() {
    router.push(
      '/homes/details/[address]/[id]',
      viewUrl(property.id, property.address)
    )

    logEvent('property_detail', 'expand', null, { id: property.id })
  }

  function onLocation(ev: React.MouseEvent<HTMLButtonElement, MouseEvent>) {
    ev.stopPropagation()

    if (showLocation) showLocation(property)
  }

  return (
    <div className='th-overview-header'>
      {onBack && (
        <Button className='th-back-button' onClick={onBack}>
          <SvgArrowBack />
        </Button>
      )}

      <div className='th-content'>
        <Breadcrumb>
          <Breadcrumb.Item>
            <SvgLogo className='th-icon' />
            For Sale
          </Breadcrumb.Item>
          <Breadcrumb.Item>
            <Link href={MAP_PAGE} as={stateLink()}>
              {region.state}
            </Link>
          </Breadcrumb.Item>
          <Breadcrumb.Item>
            <Link
              href={MAP_PAGE}
              as={regionLink([region.county, region.state])}
            >
              {region.county}
            </Link>
          </Breadcrumb.Item>
          <Breadcrumb.Item>
            <Link href={MAP_PAGE} as={regionLink([region.city, region.state])}>
              {region.city}
            </Link>
          </Breadcrumb.Item>
          <Breadcrumb.Item>
            <Link
              href={MAP_PAGE}
              as={regionLink([region.city, region.state, region.postalCode])}
            >
              {region.postalCode}
            </Link>
          </Breadcrumb.Item>
          <Breadcrumb.Item>
            <Link
              href={MAP_PAGE}
              as={regionLink([
                region.address,
                region.city,
                region.state,
                region.postalCode
              ])}
            >
              {region.address}
            </Link>
          </Breadcrumb.Item>
        </Breadcrumb>

        <div className='th-info'>
          <Status property={property} />

          <div className='th-prices'>
            <div className='th-price'>
              ${commaNumber(Math.round(property.Price))}
            </div>
            <div className='th-pricepersqft'>
              ${commaNumber(Math.round(property.PricePerSqft))} / ft²
            </div>
          </div>

          <div className='th-location-actions'>
            {showLocation ? (
              <Button className='th-location-button' onClick={onLocation}>
                <SvgMarker />
              </Button>
            ) : null}
            <div className='th-location'>
              <div className='th-address'>{property.displayAddress}</div>
              <div className='th-region'>{property.displayRegion}</div>
            </div>
          </div>

          <div className='th-metrics'>
            <ItemInfo label='Bed' value={property.BedsCount} />
            <ItemInfo label='Bath' value={property.BathsDecimal} />
            <ItemInfo
              label='Sq Ft'
              value={Math.round(property.LivingSqft)}
              comma
            />
            <ItemInfo label='Lot Size' value={property.LotAcres} fixed={2} />
            <ItemInfo label='Cars' value={property.ParkingCount} />
            <ItemInfo label='Built' value={property.YearBuilt} />
            <ItemInfo label='Permits' value={property.permitsCount} />
          </div>

          <div className='th-actions'>
            <Button onClick={toggleFavorite}>
              {isFavorite ? (
                <SvgFavorite className='th-icon th-selected' />
              ) : (
                <SvgFavoriteBorder className='th-icon' />
              )}
            </Button>
            <Button onClick={onShare}>
              <SvgShare className='th-icon' />
            </Button>
            <Button className='th-fullscreen-button' onClick={onExpand}>
              <SvgFullscreen className='th-icon' />
            </Button>
          </div>
        </div>
      </div>

      <style jsx>{styles}</style>
    </div>
  )
}

export default memo(OverviewHeader)
