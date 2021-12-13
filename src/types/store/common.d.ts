declare namespace TopHap {
  export interface Action<T = any> {
    type: T
  }

  export interface AnyAction extends Action {
    [extraProps: string]: any
  }

  export type Stage = 'dev' | 'staging' | 'prod'

  export type Coordinate = [number, number]
  export type Bounds = [Coordinate, Coordinate]
  export type AddressType = 'address'
  export type ZoneType =
    | 'school'
    | 'school-district'
    | 'neighborhood'
    | 'postcode'
    | 'place'
    | 'county'
    | 'region'
  export type PlaceType = AddressType | 'street' | ZoneType

  export type ZoneId = string

  export interface Place {
    id: string
    area?: number
    bbox?: Bounds
    center: Coordinate
    context: {
      [extra: string]: string
    }
    place_name: string
    place_type: PlaceType[]
    [eleName: string]: any
  }

  export type PropertyType =
    | 'House'
    | 'Condo'
    | 'Townhouse'
    | 'Multi-family'
    | 'Land'
    | 'Commercial'
    | 'Other'
  export type PropertyStatus =
    | 'Active'
    | 'Pending'
    | 'Sold'
    | 'Inactive'
    | 'New'

  export type Agent = {
    MemberFirstName?: string
    MemberLastName?: string
    MemberFullName?: string
    MemberStateLicense: string
    MemberKey: string
    OfficeName?: string
  }
  export type Agents = {
    List: Agent
    CoList?: Agent
  }

  export type PropertyMetric =
    | 'Price'
    | 'PricePerSqft'
    | 'LivingSqft'
    | 'LotAcres'
    | 'ParkingCount'
    | 'BedsCount'
    | 'BathsDecimal'
    | 'YearBuilt'
    | 'count'

  export type PropertyBase = {
    count: number
    BathsDecimal: number
    BedsCount: number
    LivingSqft: number
    LotAcres: number
    ParkingCount: number
    YearBuilt: number
    Price: number
    PricePerSqft: number
    DOM: number
    location: Coordinate

    analytics?: PropertyAnalytics
  }

  export type PropertySortKey =
    | 'id'
    | 'list_price'
    | 'beds'
    | 'baths'
    | 'sqft'
    | 'price_sqft'
    | 'list_date'
    | 'status_timestamp'
    | 'valuation'
    | 'year_built'
    | 'activity'

  export type Address = {
    City: string
    CountyOrParish: string
    FullAddress: string
    PostalCode: string
    StateOrProvince: string
    StreetDirPrefix: string | null
    StreetNumber: string
    StreetName: string
    UnitNumber: string | null
    UnparsedAddress?: string
  }

  export type PropertyAnalytics = {
    [key in AnalyticsMetric]: number
  }

  export type PropertyMedia = {
    photos: string[]
    count: number
  }

  export interface Property extends PropertyBase {
    id: string

    TophapStatus: PropertyStatus
    TransactionDate: string
    PreviousTransactionDate: string
    ListDate: string
    TophapStatusChangeTimestamp: string

    TransactionAmount: number
    TransactionAmountPerSqft: number
    ListAmount: number
    ListAmountPerSqft: number

    RentFlag: boolean

    PreviousListPriceDiff?: number
    OriginalListPriceDiff?: number

    estimates?: {
      estimate: number
      ppsqft: number
      rentEstimate: number
      rentPpsqft: number
      rentYieldEstimate: number
    }

    Agents?: Agents
    PublicRemarks: string

    permitsCount: number

    address: Address
    media?: PropertyMedia

    displayAddress: string
    displayRegion: string

    mls?: string
    [eleName: string]: any
  }

  export interface PropertyAggregation extends PropertyBase {
    key: string
  }

  export type TransactionType =
    | 'Listing'
    | 'Deed'
    | 'Permit'
    | 'Tax'
    | 'Foreclosure'
    | 'Loan'
  export type Facts = {
    TransactionType: TransactionType
    TransactionAmount: number | string
    TransactionDate: string
    TaxDate?: string
    [extra: string]: any
  }

  export interface PropertyHistory {
    _id: string
    _index: string
    _source: {
      Facts: Facts
      media: PropertyMedia
      meta: {
        photosHidden?: boolean
      }
      [extra: string]: any
    }
    [extra: string]: any
  }

  export type Estimates = {
    date: string
    listPriceEstimateRatio: number | string
    ppsqft: number | string
    estimateDiffFromActivePendingListing: number | string
    estimate: number | string
    estimateDiffFromSoldListing: number | string
    soldPriceEstimateRatio: number | string
    rentEstimate: number | string
    rentPpsqft: number | string
    rentYieldEstimate: number | string
    error: number | string
  }

  export type RETS = {
    media: TopHap.PropertyMedia
    [extra: string]: any
  }

  export interface PropertySource {
    _id: string
    _source: {
      Facts: Facts
      address: Address
      estimates?: Estimates
      meta?: {
        mls?: string
      }
      media: PropertyMedia
      rets?: RETS
      zones: {
        id: string
        name: string
        group: string
        type: string
        subtype: string
      }[]
      [extra: string]: any
    }
    [extra: string]: any
    sort?: Cursor
  }
  export type AggregationSource = any

  export type MapType = 'auto' | 'light' | 'color' | 'satellite' | 'dark'

  export type AnalyticsMetric =
    | 'age'
    | 'bathrooms'
    | 'bedrooms'
    | 'census_age_median'
    | 'census_collar_blue'
    | 'census_collar_white'
    | 'census_divorced'
    | 'census_educational_climate_index'
    | 'census_employee_salary_average'
    | 'census_employee_salary_median'
    | 'census_family_size'
    | 'census_household_disposable_income_median'
    // | 'census_household_income_average'
    | 'census_household_income_median'
    | 'census_household_size'
    | 'census_household_total_expenditure_average'
    // | 'census_household_total_expenditure'
    | 'census_households'
    | 'census_marriage_never'
    | 'census_marriage_now'
    | 'census_per_capita_income'
    | 'census_population'
    | 'census_population_daytime'
    | 'census_population_density'
    | 'census_population_female'
    | 'census_population_male'
    | 'census_population_seasonal'
    | 'census_separated'
    | 'census_travel_time_to_work'
    | 'census_widowed'
    | 'count'
    | 'crime'
    | 'dom'
    | 'elevation'
    | 'estimate_accuracy'
    | 'estimate_change'
    | 'estimate_list_ratio'
    | 'estimate_ppsf'
    | 'estimate_price'
    | 'estimate_rent_accuracy'
    | 'estimate_rent_ppsf'
    | 'estimate_rent_price'
    | 'estimate_sold_ratio'
    | 'garage'
    | 'hazard_co2'
    | 'hazard_earthquake'
    | 'hazard_hail'
    | 'hazard_hurricane'
    | 'hazard_lead'
    | 'hazard_no2'
    | 'hazard_ozone'
    | 'hazard_particules'
    | 'hazard_pollution'
    | 'hazard_tornado'
    | 'hazard_weather'
    | 'hazard_wind'
    | 'hoa_fee'
    | 'list_vs_sold'
    | 'living_area'
    | 'lot_size_acres'
    | 'noise'
    | 'owner_occupied'
    | 'ownership_days'
    | 'permits_count'
    | 'permits_value'
    | 'pool'
    | 'precipitation'
    | 'price_per_sqft'
    | 'profit'
    | 'property_use'
    | 'rent_yield'
    | 'school_college_bound'
    | 'school_reviewer_rating_avg'
    | 'school_students_number'
    | 'school_students_per_grade'
    | 'school_students_per_teacher'
    | 'school_teachers_number'
    | 'school_test_score_rating'
    | 'sale_price'
    | 'slope'
    | 'sold_ago'
    | 'stories'
    | 'tax'
    | 'temperature'
    | 'turnover'
    | 'unique_zones'
    | 'usable_area'
    | 'walkability'
    | 'zoned_code'
}
