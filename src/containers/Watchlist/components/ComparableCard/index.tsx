import { useContext, useMemo } from 'react'
import { ReactReduxContext } from 'react-redux'
import { useRouter } from 'next/router'
import Button from 'components/Button'
import Checkbox from 'components/Checkbox'
import { PROPERTY_DETAIL_PAGE, MAP_PAGE } from 'consts/url'
import { previewUrl, state2MapUrl } from 'utils/url'
import { viewUrl } from 'utils/properties'
import SvgDelete from 'assets/images/icons/delete.svg'
import styles from './styles.scss?type=global'

interface ComparableCardProps {
  color: string
  comparable: TopHap.Comparable
  isPrimary?: boolean
  setPrimary(): void
  remove(): void
}

export default function ComparableCard({
  color,
  comparable,
  isPrimary,
  setPrimary,
  remove
}: ComparableCardProps) {
  const router = useRouter()
  const context = useContext(ReactReduxContext)
  const [image, region, address] = useMemo(() => {
    let image = '',
      region,
      address
    if (comparable.place.place_type[0] === 'address') {
      const property = comparable.data as TopHap.Property
      const media = property.media
      if (media) {
        image = media.photos[0]
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
  }, [comparable])

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
    <div className='th-comparable-card'>
      <div className='d-flex flex-row'>
        <img className='th-image' src={image} alt='Pre`view`' />

        <div className='th-info'>
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
        </div>
      </div>
      <div className='th-actions'>
        <div className='d-flex align-items-center'>
          <div className='th-color' style={{ background: color }} />
          {isPrimary ? (
            <div className='th-primary-mark'>Primary</div>
          ) : (
            <Checkbox
              className='th-primary-check'
              label='Make Primary'
              checked={false}
              onClick={setPrimary}
            />
          )}
        </div>
        <Button className='th-delete-button' onClick={remove}>
          <SvgDelete />
        </Button>
      </div>
      <style jsx>{styles}</style>
    </div>
  )
}
