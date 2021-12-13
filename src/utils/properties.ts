import capitalize from 'capitalize'
import get from 'lodash/get'

export function formatAddress(address: TopHap.Address) {
  return capitalize.words(
    `${address.StreetNumber ? address.StreetNumber : ''} ${
      address.StreetDirPrefix ? address.StreetDirPrefix + ' ' : ''
    }${address.StreetName}${
      address.UnitNumber
        ? (address.UnitNumber.startsWith('#') ? ' ' : ' #') + address.UnitNumber
        : ''
    }`
  )
}

export function formatRegion(address: TopHap.Address) {
  if (!address.City) return ''
  return `${capitalize.words(address.City)}, ${address.StateOrProvince} ${
    address.PostalCode
  }`
}

export function status(property: TopHap.Property): string {
  if (property.TophapStatus === 'Active') {
    return property.RentFlag ? 'For Rent' : 'For Sale'
  } else if (property.TophapStatus === 'Sold') {
    return property.RentFlag ? 'Rented' : 'Sold'
  }

  return property.TophapStatus
}

export function viewUrl(id: string, address: TopHap.Address) {
  const addressString = `${address.StreetNumber} ${address.StreetDirPrefix ||
    ''} ${address.StreetName} ${address.UnitNumber || ''} ${address.City} ${
    address.StateOrProvince
  } ${address.PostalCode}`
  return `/homes/details/${addressString.replace(/\/+/g, '-')}/${id}`
    .replace(/#/g, '')
    .replace(/\s+/g, '-')
}

export function viewUrlFromPlace(id: string, place: TopHap.Place) {
  return `/homes/details/${place.place_name
    .toUpperCase()
    .replace(/\s/g, '-')
    .replace(/#|,/g, '')}/${place.id}`
}

const WEEK = 1000 * 60 * 60 * 24 * 7
export function normalize(
  data: TopHap.PropertySource,
  additional?: 'analytics' | 'detail'
) {
  const { _id, _source } = data
  const { rets } = _source
  const res: any = {}
  const facts =
    (_source.Facts.TophapStatus === 'Active' ||
      _source.Facts.TophapStatus === 'Pending') &&
    rets
      ? rets.Facts
      : _source.Facts

  res.id = _id
  res.media = _source.media
  if (get(res, 'media.photos.length') === 1) {
    // disable load more when photosHidden
    res.media.count = 1
  }
  res.address = _source.address

  res.TophapStatus = facts.TophapStatus
  res.TransactionDate = facts.TransactionDate
  res.PreviousTransactionDate = facts.PreviousTransactionDate
  res.ListDate = facts.ListDate
  res.TophapStatusChangeTimestamp =
    facts.TophapStatusChangeTimestamp ||
    (rets ? rets.TophapStatusChangeTimestamp : undefined)

  const timeDiff = new Date().getTime() - new Date(res.ListDate).getTime()

  if (res.TophapStatus === 'Active') {
    if (timeDiff < WEEK) {
      res.TophapStatus = 'New'
    }
  }

  res.TransactionAmount = Number(facts.TransactionAmount)
  res.TransactionAmountPerSqft = Number(facts.TransactionAmountPerSqft)
  res.ListAmount = Number(facts.ListAmount)
  res.ListAmountPerSqft = Number(facts.ListAmountPerSqft)

  if (_source.estimates) {
    res.estimates = {
      estimate: Number(_source.estimates.estimate),
      ppsqft: Number(_source.estimates.ppsqft),
      rentEstimate: Number(_source.estimates.rentEstimate),
      rentPpsqft: Number(_source.estimates.rentPpsqft),
      rentYieldEstimate: Number(_source.estimates.rentYieldEstimate)
    }
  }

  if (res.TophapStatus === 'Sold') {
    res.Price = res.TransactionAmount
    res.PricePerSqft = res.TransactionAmountPerSqft
  } else {
    res.Price = res.ListAmount
    res.PricePerSqft = res.ListAmountPerSqft
  }

  res.BedsCount = Number(facts.BedsCount)
  res.BathsDecimal = Number(facts.BathsDecimal)
  res.LivingSqft = Number(facts.LivingSqft)
  res.LotAcres = Number(facts.LotAcres)
  res.ParkingCount = Number(facts.ParkingCount)
  res.YearBuilt = Number(facts.YearBuilt)
  res.RentFlag = facts.RentFlag
  res.permitsCount = Number(_source.permitsCount)

  if (rets) {
    if (Array.isArray(rets.PublicRemarks)) {
      res.PublicRemarks = rets.PublicRemarks.join()
    } else {
      res.PublicRemarks = rets.PublicRemarks || ''
    }
    // TODO: OfficeName
    res.Agents = rets.Agents
    res.PreviousListPriceDiff = rets.PreviousListPriceDiff
    res.OriginalListPriceDiff = rets.OriginalListPriceDiff
  } else {
    res.PublicRemarks = ''
  }

  if (_source.address) {
    res.displayAddress = formatAddress(_source.address)
    res.displayRegion = formatRegion(_source.address)
  }

  if (_source.locations && _source.locations.parcelLocation) {
    res.location = [
      Number(_source.locations.parcelLocation.lon),
      Number(_source.locations.parcelLocation.lat)
    ]
  }

  if (_source.meta) {
    if (_source.meta.mls) res.mls = _source.meta.mls
  }
  res.count = 1

  res.DOM = Number(get(data, 'fields.dom[0]'))

  if (additional === 'analytics') {
    const analytics: any = {}
    // value
    analytics.estimate_price = Number(get(data, '_source.estimates.estimate'))
    analytics.estimate_change = Number(
      get(data, '_source.estimates.changes.past1Y')
    )
    analytics.estimate_ppsf = Number(get(data, '_source.estimates.ppsqft'))
    analytics.estimate_rent_price = Number(
      get(data, '_source.estimates.rentEstimate')
    )
    analytics.estimate_rent_ppsf = Number(
      get(data, '_source.estimates.rentPpsqft')
    )
    analytics.estimate_accuracy = get(
      data,
      '_source.estimates.changes.medianHistoryError'
    )
    analytics.estimate_rent_accuracy = get(
      data,
      '_source.estimates.changes.medianRentHistoryError'
    )

    // Property
    analytics.living_area = res.LivingSqft
    analytics.bedrooms = res.BedsCount
    analytics.bathrooms = res.BathsDecimal
    analytics.lot_size_acres = res.LotAcres
    analytics.slope = Number(get(data, '_source.locations.slope.median'))
    analytics.usable_area = Number(facts.UsableArea)
    analytics.garage = res.ParkingCount
    analytics.pool = facts.PoolFlag
    analytics.stories = Number(facts.StoriesCount)
    analytics.age = new Date().getFullYear() - Number(facts.YearBuilt)
    analytics.property_use = facts.PropertyUse

    // Region
    analytics.walkability = Number(get(data, '_source.features.walkability'))
    analytics.noise = Number(get(data, '_source.features.noise'))
    analytics.crime = get(data, '_source.features.community.zip.CRMCYTOTC')
    analytics.elevation = Number(
      get(data, '_source.locations.elevation.median')
    )
    analytics.precipitation = Number(
      get(data, '_source.features.community.zip.PRECIPANN')
    )
    analytics.temperature = {
      summer: Number(get(data, '_source.features.community.zip.TMPAVEJUL')),
      winter: Number(get(data, '_source.features.community.zip.TMPAVEJAN'))
    }
    analytics.zoned_code = facts.ZonedCodeLocal
    analytics.unique_zones = ''
    analytics.count = 1

    // Hazards
    analytics.hazard_earthquake = Number(
      get(data, '_source.features.community.zip.RSKCYQUAK')
    )
    analytics.hazard_weather = Number(
      get(data, '_source.features.community.zip.RSKCYRISK')
    )
    analytics.hazard_hail = Number(
      get(data, '_source.features.community.zip.RSKCYHANX')
    )
    analytics.hazard_hurricane = Number(
      get(data, '_source.features.community.zip.RSKCYHUNX')
    )
    analytics.hazard_lead = Number(
      get(data, '_source.features.community.zip.LEAD')
    )
    analytics.hazard_no2 = Number(
      get(data, '_source.features.community.zip.NO2')
    )
    analytics.hazard_ozone = Number(
      get(data, '_source.features.community.zip.OZONE')
    )
    analytics.hazard_particules = Number(
      get(data, '_source.features.community.zip.PM10')
    )
    analytics.hazard_pollution = Number(
      get(data, '_source.features.community.zip.AIRX')
    )
    analytics.hazard_tornado = Number(
      get(data, '_source.features.community.zip.RSKCYTONX')
    )
    analytics.hazard_co2 = Number(
      get(data, '_source.features.community.zip.CARBMONO')
    )
    analytics.hazard_wind = Number(
      get(data, '_source.features.community.zip.RSKCYWINX')
    )

    // Market
    analytics.list_vs_sold = facts.ListCloseAmountRatio * 100
    analytics.dom = res.DOM
    analytics.hoa_fee = Number(facts.HOA)
    analytics.ownership_days = facts.OwnershipDays
    // analytics.turnover
    analytics.owner_occupied = facts.OwnerOccupiedFlag

    // Investment
    analytics.rent_yield = Number(
      get(data, '_source.estimates.rentYieldEstimate')
    )
    analytics.estimate_sold_ratio = {
      percent: 100 / get(data, '_source.estimates.soldPriceEstimateRatio'),
      value:
        analytics.estimate_price *
        (1 - get(data, '_source.estimates.soldPriceEstimateRatio'))
    }
    analytics.tax = {
      improvements: facts.TaxAssessedValueImprovements,
      land: facts.TaxAssessedValueLand,
      total: facts.TaxAssessedValueTotal,
      billed: facts.TaxBilledAmount,
      billed_acre: facts.TaxBilledAmountPerAcre,
      billed_sqft: facts.TaxBilledAmountPerSqft
    }
    analytics.sale_price = res.TransactionAmount
    analytics.price_per_sqft = res.TransactionAmountPerSqft
    analytics.profit = {
      sum: Number(facts.Profit),
      margin: Number(facts.ProfitMargin)
    }
    analytics.permits_count = get(data, '_source.permitsCount')
    analytics.permits_value = get(data, '_source.permitsValueTotal')

    // Community
    analytics.census_population = get(
      data,
      '_source.features.community.zip.POPCY'
    )
    analytics.census_age_median = get(
      data,
      '_source.features.community.zip.MEDIANAGE'
    )
    analytics.census_educational_climate_index = get(
      data,
      '_source.features.community.zip.EDUINDEX'
    )
    analytics.census_travel_time_to_work = get(
      data,
      '_source.features.community.zip.TRWAVE'
    )
    analytics.census_collar_blue = get(
      data,
      '_source.features.community.zip.OCCBLUCO'
    )
    analytics.census_collar_white = get(
      data,
      '_source.features.community.zip.OCCWHTCO'
    )
    analytics.census_employee_salary_average = get(
      data,
      '_source.features.community.zip.SALAVECY'
    )
    analytics.census_employee_salary_median = get(
      data,
      '_source.features.community.zip.SALMEDCY'
    )
    analytics.census_family_size = get(
      data,
      '_source.features.community.zip.FAMAVESZ'
    )
    analytics.census_per_capita_income = get(
      data,
      '_source.features.community.zip.INCCYPCAP'
    )
    analytics.census_households = get(
      data,
      '_source.features.community.zip.HHD'
    )
    analytics.census_household_size = get(
      data,
      '_source.features.community.zip.HHDAVESZ'
    )
    analytics.census_household_income_median = get(
      data,
      '_source.features.community.zip.INCCYMEDD'
    )
    analytics.census_household_total_expenditure_average = get(
      data,
      '_source.features.community.zip.EXPTOTAL'
    )
    analytics.census_household_disposable_income_median = get(
      data,
      '_source.features.community.zip.INCCYMEDDH'
    )
    analytics.census_marriage_never =
      (get(data, '_source.features.community.zip.MARNEVER') * 100) /
      analytics.census_population
    analytics.census_marriage_now =
      (get(data, '_source.features.community.zip.MARMARR') * 100) /
      analytics.census_population
    analytics.census_divorced =
      (get(data, '_source.features.community.zip.MARDIVOR') * 100) /
      analytics.census_population
    analytics.census_widowed =
      (get(data, '_source.features.community.zip.MARWIDOW') * 100) /
      analytics.census_population
    analytics.census_separated =
      (get(data, '_source.features.community.zip.MARSEP') * 100) /
      analytics.census_population
    analytics.census_population_density = get(
      data,
      '_source.features.community.zip.POPDNSTY'
    )
    analytics.census_population_female =
      (get(data, '_source.features.community.zip.POPFEMALE') * 100) /
      analytics.census_population
    analytics.census_population_male =
      (get(data, '_source.features.community.zip.POPMALE') * 100) /
      analytics.census_population
    analytics.census_population_daytime =
      (get(data, '_source.features.community.zip.DAYPOP') * 100) /
      analytics.census_population
    analytics.census_population_seasonal =
      (get(data, '_source.features.community.zip.SEASONPOP') * 100) /
      analytics.census_population

    // School
    analytics.school_college_bound = Number(
      get(data, '_source.features.schools.high.COLLEGE_BOUND')
    )
    analytics.school_reviewer_rating_avg = {
      elementary: get(
        data,
        '_source.features.schools.elementary.REVIEWER_RATING_AVG'
      ),
      middle: get(data, '_source.features.schools.middle.REVIEWER_RATING_AVG'),
      high: get(data, '_source.features.schools.high.REVIEWER_RATING_AVG')
    }
    analytics.school_students_number = {
      elementary: get(
        data,
        '_source.features.schools.elementary.STUDENTS_NUMBER_OF'
      ),
      middle: get(data, '_source.features.schools.middle.STUDENTS_NUMBER_OF'),
      high: get(data, '_source.features.schools.high.STUDENTS_NUMBER_OF')
    }
    analytics.school_students_per_grade = {
      elementary: get(
        data,
        '_source.features.schools.elementary.STUDENTS_GRADE'
      ),
      middle: get(data, '_source.features.schools.middle.STUDENTS_GRADE'),
      high: get(data, '_source.features.schools.high.STUDENTS_GRADE')
    }
    analytics.school_students_per_teacher = {
      elementary: get(
        data,
        '_source.features.schools.elementary.STUDENT_TEACHER'
      ),
      middle: get(data, '_source.features.schools.middle.STUDENT_TEACHER'),
      high: get(data, '_source.features.schools.high.STUDENT_TEACHER')
    }
    analytics.school_teachers_number = {
      elementary: get(
        data,
        '_source.features.schools.elementary.TEACHERS_PROFESSIONAL_STAFF'
      ),
      middle: get(
        data,
        '_source.features.schools.middle.TEACHERS_PROFESSIONAL_STAFF'
      ),
      high: get(
        data,
        '_source.features.schools.high.TEACHERS_PROFESSIONAL_STAFF'
      )
    }
    analytics.school_test_score_rating = {
      // elementary: get(data, '_source.features.schools.elementary.GS_TEST_RATING'),
      // middle: get(data, '_source.features.schools.middle.GS_TEST_RATING'),
      high: get(data, '_source.features.schools.high.GS_TEST_RATING')
    }

    res.analytics = analytics
  }

  if (additional === 'detail') {
    return {
      ...facts,
      ...res
    } as TopHap.Property
  } else {
    return res as TopHap.Property
  }
}

export function normalizeAggregation(
  data: TopHap.AggregationSource,
  additional?: 'analytics'
) {
  const res: any = {}
  res.key = data.key
  res.count = data.count
  res.location = [Number(data.centroid.lon), Number(data.centroid.lat)]
  res.BedsCount = Number(data.BedsCount)
  res.BathsDecimal = Number(data.BathsDecimal)
  res.LivingSqft = Number(data.LivingSqft)
  res.LotAcres = Number(data.LotAcres)
  res.ParkingCount = Number(data.ParkingCount)
  res.YearBuilt = Number(data.YearBuilt)

  res.Price = Number(data.ListAmount || data.TransactionAmount)
  res.PricePerSqft = Number(
    data.ListAmountPerSqft || data.TransactionAmountPerSqft
  )

  if (additional === 'analytics') {
    res.analytics = data.analytics
  }

  return res as TopHap.PropertyAggregation
}
