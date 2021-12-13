import { useEffect, useRef, useState } from 'react'
import { get as getProperty } from 'services/properties'
import { normalize } from 'utils/properties'
import PropertyCard, { PropertyCardProps } from './index'
import Placeholder from './Placeholder'

interface PropertyCardWithLoadingProps extends Omit<PropertyCardProps, 'item'> {
  property: TopHap.Property | string
}

export default function PropertyCardWithLoading({
  property,
  ...props
}: PropertyCardWithLoadingProps) {
  const [item, setItem] = useState(
    typeof property === 'string' ? undefined : property
  )
  const id = useRef('')

  useEffect(() => {
    if (!property) return

    if (typeof property !== 'string') {
      setItem(property)
      id.current === property.id
      return
    }

    const propertyId = property
    id.current = propertyId

    setItem(undefined)

    getProperty(propertyId, [
      'address',
      'rets',
      'Facts',
      'media',
      'locations.parcelLocation',
      'estimates',
      'permitsCount'
    ])
      .then(propertyData => {
        if (propertyData._id !== id.current) return
        setItem(normalize(propertyData))
      })
      .catch(console.error)
  }, [property])

  if (item) {
    return (
      <PropertyCard
        item={item}
        isMobile={props.isMobile}
        lazyload={props.lazyload}
        rentalEstimate={props.rentalEstimate}
        {...props}
      />
    )
  } else {
    return <Placeholder />
  }
}
