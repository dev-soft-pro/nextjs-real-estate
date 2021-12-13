import React from 'react'
import get from 'lodash/get'
import styles from './styles.scss?type=global'

export function Record({
  title,
  children
}: {
  title: string
  children?: React.ReactNode
}) {
  if (!children) return null
  return (
    <li className='th-record'>
      <p className='th-record-title'>{title}</p>
      <p className='th-record-value'>{children}</p>
    </li>
  )
}

interface PublicRecordsProps {
  authenticated: boolean
  history: TopHap.PropertyHistory[]
}

function PublicRecords({ authenticated, history }: PublicRecordsProps) {
  const tax = history.find(e => e._source.Facts.TransactionType === 'Tax')

  if (!tax) return null

  function getValue(object: any, field: string | string[]) {
    return get(object._source, field)
  }

  return (
    <div className='th-records th-public-records'>
      {authenticated && (
        <>
          <h5 className='th-section-title'>Owner Information</h5>
          <ul className='th-section-content'>
            <Record title='Owner 1 Description'>
              {getValue(tax, 'OwnerTypeDescription1')}
            </Record>
            <Record title='Owner 1 First Name'>
              {getValue(tax, 'PartyOwner1NameFirst')}
            </Record>
            <Record title='Owner 1 Last Name'>
              {getValue(tax, 'PartyOwner1NameLast')}
            </Record>
            <Record title='Owner 1 Full Name'>
              {getValue(tax, 'PartyOwner1NameFull')}
            </Record>
            <Record title='Owner 2 Description'>
              {getValue(tax, 'OwnerTypeDescription2')}
            </Record>
            <Record title='Owner 2 First Name'>
              {getValue(tax, 'PartyOwner2NameFirst')}
            </Record>
            <Record title='Owner 2 Last Name'>
              {getValue(tax, 'PartyOwner2NameLast')}
            </Record>
            <Record title='Owner 2 Full Name'>
              {getValue(tax, 'PartyOwner2NameFull')}
            </Record>
            <Record title='Owner 3 Description'>
              {getValue(tax, 'OwnerTypeDescription3')}
            </Record>
            <Record title='Owner 3 First Name'>
              {getValue(tax, 'PartyOwner3NameFirst')}
            </Record>
            <Record title='Owner 3 Last Name'>
              {getValue(tax, 'PartyOwner3NameLast')}
            </Record>
            <Record title='Owner 3 Full Name'>
              {getValue(tax, 'PartyOwner3NameFull')}
            </Record>
            <Record title='Owner 4 Description'>
              {getValue(tax, 'OwnerTypeDescription4')}
            </Record>
            <Record title='Owner 4 First Name'>
              {getValue(tax, 'PartyOwner4NameFirst')}
            </Record>
            <Record title='Owner 4 Last Name'>
              {getValue(tax, 'PartyOwner4NameLast')}
            </Record>
            <Record title='Owner 4 Full Name'>
              {getValue(tax, 'PartyOwner4NameFull')}
            </Record>
            <Record title='Owner Mail Address'>
              {getValue(tax, 'ContactOwnerMailAddressFull')}
            </Record>
            <Record title='Owner Mail Address City'>
              {getValue(tax, 'ContactOwnerMailAddressCity')}
            </Record>
            <Record title='Owner Mail Address State'>
              {getValue(tax, 'ContactOwnerMailAddressState')}
            </Record>
            <Record title='Owner Mail Address ZIP'>
              {getValue(tax, 'ContactOwnerMailAddressZIP')}
            </Record>
            <Record title='Owner Mail Address ZIP4'>
              {getValue(tax, 'ContactOwnerMailAddressZIP4')}
            </Record>
            <Record title='Owner Mail Address CRRT'>
              {getValue(tax, 'ContactOwnerMailAddressCRRT')}
            </Record>
            <Record title='Owner Mailing County'>
              {getValue(tax, 'ContactOwnerMailingCounty')}
            </Record>
            <Record title='Owner Mailing FIPS'>
              {getValue(tax, 'ContactOwnerMailingFIPS')}
            </Record>
            <Record title='Trust Description'>
              {getValue(tax, 'TrustDescription')}
            </Record>
            <Record title='Status Owner Occupied'>
              {getValue(tax, 'StatusOwnerOccupiedFlag')}
            </Record>
            <Record title='Deed Last Document Number'>
              {getValue(tax, 'DeedLastDocumentNumber')}
            </Record>
            <Record title='Deed Last Sale Date'>
              {getValue(tax, 'DeedLastSaleDate')}
            </Record>
            <Record title='Deed Last Sale Price'>
              {getValue(tax, 'DeedLastSalePrice')}
            </Record>
            <Record title='Deed Last Sale Transaction ID'>
              {getValue(tax, 'DeedLastSaleTransactionID')}
            </Record>
            <Record title='Last Ownership Transfer Date'>
              {getValue(tax, 'LastOwnershipTransferDate')}
            </Record>
            <Record title='Last Ownership Transfer DocumentNumber'>
              {getValue(tax, 'LastOwnershipTransferDocumentNumber')}
            </Record>
            <Record title='Last Ownership Transfer Transaction ID'>
              {getValue(tax, 'LastOwnershipTransferTransactionID')}
            </Record>
          </ul>
        </>
      )}

      <p className='th-section-title'>Property</p>
      <ul className='th-section-content'>
        <Record title='Area Building'>{getValue(tax, 'AreaBuilding')}</Record>
        <Record title='Area 1st Floor'>{getValue(tax, 'Area1stFloor')}</Record>
        <Record title='Area 2nd Floor'>{getValue(tax, 'Area2ndFloor')}</Record>
        <Record title='Bedrooms Count'>{getValue(tax, 'BedroomsCount')}</Record>
        <Record title='Bathrooms Count'>
          {getValue(tax, 'BathTotalDecimal')}
        </Record>
        <Record title='Parking Garage'>{getValue(tax, 'ParkingGarage')}</Record>
        <Record title='Parking Garage Area'>
          {getValue(tax, 'ParkingGarageArea')}
        </Record>
        <Record title='Driveway Area'>{getValue(tax, 'DrivewayArea')}</Record>
        <Record title='Fence Area'>{getValue(tax, 'FenceArea')}</Record>
        <Record title='Fireplace Count'>
          {getValue(tax, 'FireplaceCount')}
        </Record>
        <Record title='HVAC Heating Detail'>
          {getValue(tax, 'HVACHeatingDetail')}
        </Record>
        <Record title='HVAC Heating Fuel'>
          {getValue(tax, 'HVACHeatingFuel')}
        </Record>
        <Record title='Patio Area'>{getValue(tax, 'PatioArea')}</Record>
        <Record title='Plumbing Fixtures Count'>
          {getValue(tax, 'PlumbingFixturesCount')}
        </Record>
        <Record title='Pool'>{getValue(tax, 'Pool')}</Record>
        <Record title='Pool Area'>{getValue(tax, 'PoolArea')}</Record>
        <Record title='Porch Area'>{getValue(tax, 'PorchArea')}</Record>
        <Record title='Roof Material'>{getValue(tax, 'RoofMaterial')}</Record>
        <Record title='Rooms Attic Area'>
          {getValue(tax, 'RoomsAtticArea')}
        </Record>
        <Record title='Rooms Basement Area'>
          {getValue(tax, 'RoomsBasementArea')}
        </Record>
        <Record title='Rooms Basement Area Finished'>
          {getValue(tax, 'RoomsBasementAreaFinished')}
        </Record>
        <Record title='Rooms Basement Area Unfinished'>
          {getValue(tax, 'RoomsBasementAreaUnfinished')}
        </Record>
        <Record title='Rooms Count'>{getValue(tax, 'RoomsCount')}</Record>
        <Record title='Shed Code'>{getValue(tax, 'ShedCode')}</Record>
        <Record title='Stories Count'>{getValue(tax, 'StoriesCount')}</Record>
        <Record title='Units Count'>{getValue(tax, 'UnitsCount')}</Record>
        <Record title='View Description'>
          {getValue(tax, 'ViewDescription')}
        </Record>
        <Record title='Year Built'>{getValue(tax, 'YearBuilt')}</Record>
        <Record title='Year Built Effective'>
          {getValue(tax, 'YearBuiltEffective')}
        </Record>
      </ul>

      <p className='th-section-title'>Parcel</p>
      <ul className='th-section-content'>
        <Record title='Zoned Code Local'>
          {getValue(tax, 'ZonedCodeLocal')}
        </Record>
        <Record title='Area Lot Acres'>{getValue(tax, 'AreaLotAcres')}</Record>
        <Record title='Area Lot SF'>{getValue(tax, 'AreaLotSF')}</Record>
        <Record title='Parcel Number Year Added'>
          {getValue(tax, 'ParcelNumberYearAdded')}
        </Record>
        <Record title='Legal Description'>
          {getValue(tax, 'LegalDescription')}
        </Record>
        <Record title='Legal Lot Number 1'>
          {getValue(tax, 'LegalLotNumber1')}
        </Record>
        <Record title='Legal Lot Number 2'>
          {getValue(tax, 'LegalLotNumber2')}
        </Record>
        <Record title='Parcel Number Formatted'>
          {getValue(tax, 'ParcelNumberFormatted')}
        </Record>
        <Record title='Parcel Number Raw'>
          {getValue(tax, 'ParcelNumberRaw')}
        </Record>
        <Record title='Parcel Number Year Change'>
          {getValue(tax, 'ParcelNumberYearChange')}
        </Record>
        <Record title='Parcel Shell Record'>
          {getValue(tax, 'ParcelShellRecord')}
        </Record>
        <Record title='Property Address'>
          {getValue(tax, 'PropertyAddressFull')}
        </Record>
        <Record title='Property Address City'>
          {getValue(tax, 'PropertyAddressCity')}
        </Record>
        <Record title='Property Address State'>
          {getValue(tax, 'PropertyAddressState')}
        </Record>
        <Record title='Property Address ZIP'>
          {getValue(tax, 'PropertyAddressZIP')}
        </Record>
        <Record title='Property Address ZIP4'>
          {getValue(tax, 'PropertyAddressZIP4')}
        </Record>
        <Record title='Property Address CRRT'>
          {getValue(tax, 'PropertyAddressCRRT')}
        </Record>
        <Record title='Situs County'>{getValue(tax, 'SitusCounty')}</Record>
        <Record title='Situs State Code'>
          {getValue(tax, 'SitusStateCode')}
        </Record>
        <Record title='Situs State County FIPS'>
          {getValue(tax, 'SitusStateCountyFIPS')}
        </Record>
        <Record title='Property Jurisdiction Name'>
          {getValue(tax, 'PropertyJurisdictionName')}
        </Record>
        <Record title='Property Latitude'>
          {getValue(tax, 'PropertyLocation.lat')}
        </Record>
        <Record title='Property Longitude'>
          {getValue(tax, 'PropertyLocation.lon')}
        </Record>
        <Record title='Property Use Group'>
          {getValue(tax, 'PropertyUseGroup')}
        </Record>
        <Record title='Property Use Muni'>
          {getValue(tax, 'PropertyUseMuni')}
        </Record>
        <Record title='Property Use Standardized'>
          {getValue(tax, 'PropertyUseStandardized')}
        </Record>
        <Record title='CBSA Code'>{getValue(tax, 'CBSACode')}</Record>
        <Record title='CBSA Name'>{getValue(tax, 'CBSAName')}</Record>
        <Record title='Census Block'>{getValue(tax, 'CensusBlock')}</Record>
        <Record title='Census Block Group'>
          {getValue(tax, 'CensusBlockGroup')}
        </Record>
        <Record title='Census FIPS Place Code'>
          {getValue(tax, 'CensusFIPSPlaceCode')}
        </Record>
        <Record title='Census Tract'>{getValue(tax, 'CensusTract')}</Record>
        <Record title='Combined Statistical Area'>
          {getValue(tax, 'CombinedStatisticalArea')}
        </Record>
        <Record title='Congressional District House'>
          {getValue(tax, 'CongressionalDistrictHouse')}
        </Record>
        <Record title='Legal Tract Number'>
          {getValue(tax, 'LegalTractNumber')}
        </Record>
        <Record title='MSA Code'>{getValue(tax, 'MSACode')}</Record>
        <Record title='MSA Name'>{getValue(tax, 'MSAName')}</Record>
        <Record title='Metropolitan Division'>
          {getValue(tax, 'MetropolitanDivision')}
        </Record>
        <Record title='Minor Civil DivisionCode'>
          {getValue(tax, 'MinorCivilDivisionCode')}
        </Record>
        <Record title='Minor Civil DivisionName'>
          {getValue(tax, 'MinorCivilDivisionName')}
        </Record>
      </ul>

      <p className='th-section-title'>Transactions</p>
      <ul className='th-section-content'>
        <Record title='Assessor Last Sale Date'>
          {getValue(tax, 'AssessorLastSaleDate')}
        </Record>
        <Record title='Assessor Last Sale Amount'>
          {getValue(tax, 'AssessorLastSaleAmount')}
        </Record>
        <Record title='Assessor Prior Sale Date'>
          {getValue(tax, 'AssessorPriorSaleDate')}
        </Record>
        <Record title='Assessor Prior SaleAmount'>
          {getValue(tax, 'AssessorPriorSaleAmount')}
        </Record>
      </ul>

      <p className='th-section-title'>Tax</p>
      <ul className='th-section-content'>
        <Record title='Previous Assessed Value'>
          {getValue(tax, 'PreviousAssessedValue')}
        </Record>
        <Record title='Tax Assessed Improvements Perc'>
          {getValue(tax, 'TaxAssessedImprovementsPerc')}
        </Record>
        <Record title='Tax Assessed Value Improvements'>
          {getValue(tax, 'TaxAssessedValueImprovements')}
        </Record>
        <Record title='Tax Assessed Value Land'>
          {getValue(tax, 'TaxAssessedValueLand')}
        </Record>
        <Record title='Tax Assessed Value Total'>
          {getValue(tax, 'TaxAssessedValueTotal')}
        </Record>
        <Record title='Tax Billed Amount'>
          {getValue(tax, 'TaxBilledAmount')}
        </Record>
        <Record title='Tax Fiscal Year'>
          {getValue(tax, 'TaxFiscalYear')}
        </Record>
        <Record title='Tax Market Value Improvements'>
          {getValue(tax, 'TaxMarketValueImprovements')}
        </Record>
        <Record title='Tax Market Value Land'>
          {getValue(tax, 'TaxMarketValueLand')}
        </Record>
        <Record title='Tax Market Value Total'>
          {getValue(tax, 'TaxMarketValueTotal')}
        </Record>
        <Record title='Tax Rate Area'>{getValue(tax, 'TaxRateArea')}</Record>
        <Record title='Tax Year Assessed'>
          {getValue(tax, 'TaxYearAssessed')}
        </Record>
        <Record title='Assr Last Updated'>
          {getValue(tax, 'AssrLastUpdated')}
        </Record>
      </ul>

      <style jsx>{styles}</style>
    </div>
  )
}

export default React.memo(PublicRecords)
