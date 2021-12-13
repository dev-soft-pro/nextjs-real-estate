import { useContext } from 'react'
import { ReactReduxContext } from 'react-redux'
import { useRouter } from 'next/router'
import cn from 'classnames'
import { useAsyncMemo } from 'use-async-memo'

import Button from 'components/Button'

import { PROPERTY_DETAIL_PAGE, MAP_PAGE } from 'consts/url'
import { previewUrl, state2MapUrl } from 'utils/url'
import { viewUrl } from 'utils/properties'
import SvgDelete from 'assets/images/icons/delete.svg'
import SvgVisible from 'assets/images/icons/eye.svg'
import SvgInvisible from 'assets/images/icons/eye_off.svg'
import { googleMapKey } from 'configs'
import { accessToken } from 'configs/mapbox'
import styles from './styles.scss?type=global'

interface ComparableCardProps {
  color: string
  comparable: TopHap.Comparable
  isPrimary?: boolean
  hide?: boolean
  setPrimary(): void
  toggleVisiblity(): void
  remove(): void
}

export default function ComparableCard({
  color,
  comparable,
  isPrimary,
  hide,
  setPrimary,
  toggleVisiblity,
  remove
}: ComparableCardProps) {
  const router = useRouter()
  const context = useContext(ReactReduxContext)

  const [image, region, address] = useAsyncMemo(
    async () => {
      let image = '',
        region,
        address
      if (comparable.place.place_type[0] === 'address') {
        const property = comparable.data as TopHap.Property
        const media = property.media
        if (media && media.count) {
          image = media.photos[0]
        } else {
          const { center } = comparable.place

          const status = await fetch(
            `https://maps.googleapis.com/maps/api/streetview/metadata?location=${center[1]},${center[0]}&key=${googleMapKey}`
          )
            .then(res => res.json())
            .then(res => res.status)
            .catch(console.log)

          if (status === 'OK') {
            image = `https://maps.googleapis.com/maps/api/streetview?size=450x300&location=${center[1]},${center[0]}&key=${googleMapKey}`
          } else {
            image = `https://api.mapbox.com/styles/v1/tophapinc/ck0jt2g8u0vle1cqjg7cw4nxc/static/${center[0]},${center[1]},18,0,0/640x480@2x?access_token=${accessToken}`
          }
        }

        region = property.displayRegion
        address = property.displayAddress
      } else {
        image = previewUrl(
          comparable.place.place_name,
          comparable.data.location,
          540,
          280,
          10,
          comparable.place.bbox
        )

        address = comparable.place.place_name
      }

      return [image, region, address]
    },
    [comparable],
    []
  )

  function onView() {
    if (comparable.place.place_type[0] === 'address') {
      router.push(
        PROPERTY_DETAIL_PAGE,
        viewUrl(
          comparable.place.id,
          (comparable.data as TopHap.Property).address
        )
      )
    } else {
      const store = context.store.getState()
      const newStore = {
        ...store,
        preferences: {
          ...store.preferences,
          keyword: comparable.place.place_name,
          place: comparable.place
        }
      }

      router.push(MAP_PAGE, state2MapUrl(newStore))
    }
  }

  return (
    <div className={cn('th-comparable-card', { 'th-primary': isPrimary })}>
      <div className='th-preview-container' style={{ borderColor: color }}>
        <div className='th-image'>
          <img key={image} src={image} alt='Preview' />
        </div>

        <Button className='th-view-button' onClick={onView}>
          {comparable.place.place_type[0] === 'address'
            ? 'View Property'
            : 'View Map'}
        </Button>

        <div className='th-address'>
          {address}
          <br />
          {region}
        </div>

        <div className='th-actions'>
          {isPrimary ? (
            <div className='th-primary-mark'>Primary</div>
          ) : (
            <Button className='th-primary-button' onClick={setPrimary}>
              Make Primary
            </Button>
          )}
          <div className='d-flex flex-row'>
            <Button className='th-delete-button' onClick={remove}>
              <SvgDelete />
            </Button>
            <Button className='th-visible-button' onClick={toggleVisiblity}>
              {hide ? <SvgInvisible /> : <SvgVisible />}
            </Button>
          </div>
        </div>
      </div>
      <style jsx>{styles}</style>
    </div>
  )
}
