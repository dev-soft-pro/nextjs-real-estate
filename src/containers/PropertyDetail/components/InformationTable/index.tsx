import React, { useLayoutEffect, useRef, useState } from 'react'
import get from 'lodash/get'
import isNil from 'lodash/isNil'
import isNaN from 'lodash/isNaN'
import styles from './styles.scss?type=global'

interface Props {
  history: TopHap.PropertyHistory[]
  property: TopHap.PropertySource
}

type SubItemProps = {
  title: React.ReactNode
  children?: string | boolean | number | string[] | number[]
  prefix?: string
}

const SubItem: React.FC<SubItemProps> = ({ title, children, prefix }) => {
  if (isNil(children) || isNaN(children)) return null

  return (
    <li>
      {title}: {prefix}{' '}
      {Array.isArray(children) ? children.join(', ') : children}
    </li>
  )
}

type ItemProps = {
  title: React.ReactNode
  children?: React.ReactNode
}
const Item: React.FC<ItemProps> = ({ title, children }) => {
  if (isNil(children) || isNaN(children)) return null

  const hasChild = (Array.isArray(children) ? children : [children]).reduce(
    (acc, cur) => get(cur, 'props.children') || acc,
    false
  )
  if (!hasChild) return null

  return (
    <div className='th-table-item'>
      <div className='th-item-name'>{title}</div>
      <ul className='th-item-info'>{children}</ul>
    </div>
  )
}

type SectionProps = ItemProps
const Section: React.FC<SectionProps> = ({ title, children }) => {
  if (isNil(children) || isNaN(children)) return null

  const [isEmpty, setEmpty] = useState(false)
  const refContent = useRef<HTMLDivElement>(null)
  useLayoutEffect(() => {
    if (refContent.current) {
      if (!refContent.current.children.length) {
        setEmpty(true)
      }
    }
  }, [refContent.current])

  if (isEmpty) return null

  return (
    <section className='th-table-section'>
      <div className='th-section-title'>{title}</div>
      <div className='th-section-content' ref={refContent}>
        {children}
      </div>
    </section>
  )
}

const InformationTable: React.FC<Props> = ({ history }) => {
  // const Facts = get(property, '_source.Facts')
  // const features = get(property, '_source.features')
  const rets = get(
    history.filter(e => e._source.Facts.TransactionType === 'Listing'),
    '0'
  )

  return (
    <div className='th-information-table'>
      <Section title='Interior Features'>
        <Item title='Levels'>
          <SubItem title='# of Levels'>{get(rets, '_source.Levels')}</SubItem>
          <SubItem title='Street Level Features'>
            {get(rets, '_source.RoomMainBedroomLevel')}
          </SubItem>
          <SubItem title='Upper Level Features'>
            {get(rets, '_source.RoomUpperBedroomLevel')}
          </SubItem>
        </Item>
        <Item title='Interior Features'>
          <SubItem title='# of Rooms'>
            {get(rets, '_source.RoomsTotal')}
          </SubItem>
          <SubItem title='# of Fireplaces'>
            {get(rets, '_source.FireplacesTotal')}
          </SubItem>
          <SubItem title='Fireplace Features'>
            {get(rets, '_source.FireplaceFeatures')}
          </SubItem>
          <SubItem title='Flooring'>{get(rets, '_source.Flooring')}</SubItem>
          <SubItem title='Other Equipment'>
            {get(rets, '_source.OtherEquipment')}
          </SubItem>
        </Item>
        <Item title='Bathroom Information'>
          <SubItem title='# of Baths'>
            {get(rets, '_source.BathroomsFull')}
          </SubItem>
          <SubItem title='# of Partial Baths'>
            {get(rets, '_source.BathroomsPartial')}
          </SubItem>
          <SubItem title='Master Bath'>
            {get(rets, '_source.RoomMasterBathroomFeatures')}
          </SubItem>
        </Item>
        <Item title='Kitchen Features'>
          <SubItem title='Kitchen'>
            {get(rets, '_source.RoomKitchenFeatures')}
          </SubItem>
        </Item>
        <Item title='Laundry Features'>
          <SubItem title='Laundry'>
            {get(rets, '_source.LaundryFeatures')}
          </SubItem>
        </Item>
        <Item title='Additional Rooms'>
          <SubItem title='Rooms'>{get(rets, '_source.RoomAdditional')}</SubItem>
        </Item>
        <Item title='Heating & Cooling'>
          <SubItem title='Cooling'>{get(rets, '_source.Cooling')}</SubItem>
          <SubItem title='Heating'>{get(rets, '_source.Heating')}</SubItem>
        </Item>
      </Section>

      <Section title='Parking / Garage, Homeowners Association, School / Neighborhood, Documents & Disclosures'>
        <Item title='Garage & Parking'>
          <SubItem title='Garage'>
            {get(rets, '_source.GarageYN') ? 'Yes' : 'No'}
          </SubItem>
          <SubItem title='# of Garage Spaces'>
            {get(rets, '_source.GarageSpaces')}
          </SubItem>
          <SubItem title='Parking Features'>
            {get(rets, '_source.ParkingFeatures')}
          </SubItem>
        </Item>
        <Item title='Homeowners Association Information'>
          <SubItem title='HOA'>
            {get(rets, '_source.AssociationYN') ? 'Yes' : 'No'}
          </SubItem>
          <SubItem title='HOA Name'>
            {get(rets, '_source.AssociationName')}
          </SubItem>
          <SubItem title='HOA Phone'>
            {get(rets, '_source.AssociationPhone')}
          </SubItem>
          <SubItem title='Dues' prefix='$'>
            {get(rets, '_source.AssociationFee')}
          </SubItem>
          <SubItem title='Dues Frequency'>
            {get(rets, '_source.AssociationFeeFrequency')}
          </SubItem>
          <SubItem title='HOA Fee Includes'>
            {get(rets, '_source.AssociationFeeIncludes')}
          </SubItem>
          <SubItem title='HOA Ammenities'>
            {get(rets, '_source.AssociationAmenities')}
          </SubItem>
          <SubItem title='Documents Available'>
            {get(rets, '_source.DocumentsAvailable')}
          </SubItem>
        </Item>
        <Item title='School Information'>
          <SubItem title='High School District'>
            {get(rets, '_source.HighSchoolDistrict')}
          </SubItem>
        </Item>
      </Section>

      <Section title='Exterior Features'>
        <Item title='Building Information'>
          <SubItem title='Builder / Architect'>
            {get(rets, '_source.BuilderName')}
          </SubItem>
          <SubItem title='Construction Status'>
            {get(rets, '_source.ConstructionStatus')}
          </SubItem>
          <SubItem title='Exterior Features'>
            {get(rets, '_source.ExteriorFeatures')}
          </SubItem>
          <SubItem title='Roof'>{get(rets, '_source.Roof')}</SubItem>
        </Item>
        <Item title='Pool Information'>
          <SubItem title='Pool'>
            {get(rets, '_source.PoolPrivateYN') ? 'Yes' : 'No'}
          </SubItem>
          <SubItem title='Pool Features'>
            {get(rets, '_source.PoolFeatures')}
          </SubItem>
        </Item>
        <Item title='Water & Sewer'>
          <SubItem title='Type'>{get(rets, '_source.Sewer')}</SubItem>
        </Item>
      </Section>

      <Section title='Property / Lot Details'>
        <Item title='Property Information'>
          <SubItem title='Parcel #'>
            {get(rets, '_source.ParcelNumber')}
          </SubItem>
          <SubItem title='Green Energy Features'>
            {get(rets, '_source.GreenEnergyGenerations')}
          </SubItem>
        </Item>

        <Item title='Lot Information'>
          <SubItem title='Zoning'>{get(rets, '_source.Zoning')}</SubItem>
          <SubItem title='Lot Features'>
            {get(rets, '_source.LotFeatures')}
          </SubItem>
          <SubItem title='Yard Description'>
            {get(rets, '_source.YardDescription')}
          </SubItem>
          <SubItem title='View'>{get(rets, '_source.View')}</SubItem>
        </Item>
      </Section>

      <Section title='Location Details'>
        <Item title='Location Information'>
          <SubItem title='Directions'>
            {get(rets, '_source.Directions')}
          </SubItem>
          <SubItem title='Cross Street'>
            {get(rets, '_source.CrossStreet')}
          </SubItem>
        </Item>
      </Section>

      <style jsx>{styles}</style>
    </div>
  )
}

export default InformationTable
