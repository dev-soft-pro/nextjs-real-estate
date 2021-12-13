import React from 'react'
import commaNumber from 'comma-number'
import { Record } from '../PublicRecords'

// import SvgAC from 'assets/images/metrics/airconditioner.svg'
import SvgBath from 'assets/images/metrics/bath.svg'
import SvgBeds from 'assets/images/metrics/bed.svg'
import SvgClock from 'assets/images/metrics/clock.svg'
import SvgDate from 'assets/images/metrics/date.svg'
import SvgLivingArea from 'assets/images/metrics/living-area.svg'
import SvgLot from 'assets/images/metrics/lot.svg'
import SvgGarage from 'assets/images/metrics/garage.svg'
import SvgPrice from 'assets/images/metrics/price.svg'
import { MILISECONDS_IN_DAY } from 'consts'

import styles from './styles.scss?type=global'

function OverviewRecord({
  icon,
  prefix,
  suffix,
  value
}: {
  icon: React.ReactNode
  prefix?: string
  suffix?: string
  value?: string | number
}) {
  if (!value) return null

  return (
    <li className='th-overview-record col-4'>
      <span className='th-icon'>{icon}</span>
      <span className='th-value'>
        {prefix} {value} {suffix}
      </span>
    </li>
  )
}

interface OverviewProps {
  mls: TopHap.PropertiesState['mls']
  property: TopHap.Property
}

export default function Overview({ mls, property }: OverviewProps) {
  const { Agents } = property

  let dom
  if (property.TophapStatus === 'Sold') {
    dom = property.TransactionDays
  } else {
    dom = Math.ceil(
      (new Date().getTime() - new Date(property.ListDate).getTime()) /
        MILISECONDS_IN_DAY
    )
  }

  return (
    <div className='th-overview'>
      <ul className='th-overview-records'>
        {/* <OverviewRecord
          icon={<SvgAC />}
          value={rets && rets.Cooling ? rets.Cooling[0] : ''}
        /> */}
        <OverviewRecord
          icon={<SvgDate />}
          prefix='Built in'
          value={property.YearBuilt}
        />
        <OverviewRecord
          icon={<SvgBeds />}
          value={property.BedsCount}
          suffix='beds'
        />
        <OverviewRecord
          icon={<SvgLot />}
          value={property.LotAcres.toFixed(2)}
          suffix='ac lot'
        />
        <OverviewRecord
          icon={<SvgClock />}
          value={dom}
          suffix='days on TopHap'
        />
        <OverviewRecord
          icon={<SvgBath />}
          value={property.BathsDecimal}
          suffix='baths'
        />
        <OverviewRecord
          icon={<SvgLivingArea />}
          value={property.LivingSqft}
          suffix='ft² living area'
        />
        <OverviewRecord
          icon={<SvgGarage />}
          value={Math.round(property.ParkingCount)}
          suffix='parking spaces'
        />
        <OverviewRecord
          icon={<SvgPrice />}
          value={commaNumber(Math.round(property.PricePerSqft))}
          suffix='/ ft²'
        />
      </ul>
      {Agents && (
        <ul className='th-records'>
          <h5 className='th-section-title'>Listing Provided by</h5>
          <Record title='Listing Agent'>
            {Agents.List.MemberFullName}
            <br />
            DRE# {Agents.List.MemberStateLicense}
          </Record>
          <Record title='Listing Office'>
            {Agents.List.OfficeName} <br />
          </Record>

          {property.mls && mls[property.mls] && (
            <Record title='Source'>
              {mls[property.mls].name}
              <img
                className='th-mls-logo'
                src={`https://s3-us-west-2.amazonaws.com/tophap-assets/mls/${
                  mls[property.mls].logo
                }`}
                alt={mls[property.mls].name}
              />
            </Record>
          )}
        </ul>
      )}

      <style jsx>{styles}</style>
    </div>
  )
}
