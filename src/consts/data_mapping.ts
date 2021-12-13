import commaNumber from 'comma-number'
import NumAbbr from 'number-abbreviate'
import isNil from 'lodash/isNil'
const numAbbr = new NumAbbr(['K', 'M', 'B', 'T'])

type AnalyticsLayerMeta = {
  prefix?: string
  suffix?: string
  comma?: boolean
  numberOfDecimals?: number
  valueType?: string // handle as 'number' if undefined
  removeZero?: boolean
  minPercentile?: number
  maxPercentile?: number
}

export type AnalyticsLayer = AnalyticsLayerMeta & {
  title: string
  tooltip?: string
  hasCloseDate?: boolean
  role?: 'free' | 'pro' | 'advanced'
  aggregation?: AnalyticsLayerMeta
  parcel?: AnalyticsLayerMeta
}

export const DEFAULT_MIN_PERCENTILE_PARCEL = 0.05
export const DEFAULT_MAX_PERCENTILE_PARCEL = 0.95
export const DEFAULT_MIN_PERCENTILE_AGGREGATION = 0.03
export const DEFAULT_MAX_PERCENTILE_AGGREGATION = 0.97

export const descriptiveData: {
  [key in TopHap.AnalyticsMetric]: AnalyticsLayer
} = {
  age: {
    title: 'Age',
    suffix: 'yrs',
    tooltip: 'Property Age (years)',
    numberOfDecimals: 2
  },
  bathrooms: {
    title: 'Bathroom Count',
    tooltip: 'Property Number of Bathrooms',
    numberOfDecimals: 1
  },
  bedrooms: {
    title: 'Bedroom Count',
    tooltip: 'Property Number of Bedrooms',
    numberOfDecimals: 0
  },
  census_age_median: {
    title: 'Median Age',
    suffix: 'yrs',
    numberOfDecimals: 0,
    tooltip:
      'Half of the total population is above the listed age, half is below it.'
  },
  census_collar_blue: {
    title: 'Occupations: Blue Collar',
    numberOfDecimals: 0,
    tooltip:
      'Blue collar occupations include: farming, forestry and fishing; handlers, equipment cleaners, helpers and laborers; machine operators, assemblers and inspectors; precision production, craft and repair; private household services; protective services; services other than protective and household; administrative and clerical support; sales; and transportation and material moving.'
  },
  census_collar_white: {
    title: 'Occupations: White Collar',
    numberOfDecimals: 0,
    tooltip:
      'White collar workers are traditionally defined as office workers. White collar occupations include: executive, administrative and managerial; professional specialties; and technicians and related support.'
  },
  census_divorced: {
    title: 'Divorced',
    suffix: '%',
    numberOfDecimals: 0,
    tooltip:
      'Percentage of people living in the area who are currently divorced.'
  },
  census_educational_climate_index: {
    title: 'Educational Climate Index',
    numberOfDecimals: 0,
    tooltip:
      'This measure of socioeconomic status is based on the U.S. Census Bureau’s Socioeconomic Status (SES) measure with weights adjusted to more strongly reflect the educational aspect of social status (education 2:1 to income & occupation). Factors in this measure are income, educational achievement and occupation of persons within the ZIP code. Since this measure is based on the population of an entire ZIP code, it may not reflect the nature of an individual school.'
  },
  census_employee_salary_average: {
    title: 'Average Employee Salary',
    comma: true,
    suffix: '$',
    numberOfDecimals: 0,
    tooltip: 'The average employee salary for people in the area.'
  },
  census_employee_salary_median: {
    title: 'Median Employee Salary',
    comma: true,
    suffix: '$',
    numberOfDecimals: 0,
    tooltip: 'Median employee salary for people in this area.'
  },
  census_family_size: {
    title: 'Average Household Size',
    numberOfDecimals: 1,
    tooltip: 'Average family size for people living in the area.'
  },
  census_household_disposable_income_median: {
    title: 'Disposable Household Income',
    numberOfDecimals: 0,
    prefix: '$',
    suffix: '/yr',
    comma: true,
    tooltip:
      'Half the households have disposable income above the amount listed; half have disposable income below it.'
  } /*,
  census_household_income_average: {
    title: 'Household Income',
    numberOfDecimals: 0,
    prefix: '$',
    suffix: '/yr',
    comma: true,
    tooltip: 'Average income of households in the area.'
  }*/,
  census_household_income_median: {
    title: 'Household Income',
    numberOfDecimals: 0,
    prefix: '$',
    suffix: '/yr',
    comma: true,
    tooltip: 'Median income of households in the area.'
  },
  census_household_size: {
    title: 'Average Household Size',
    numberOfDecimals: 1,
    suffix: 'ppl',
    tooltip: 'Average size of area households in number of people'
  },
  census_household_total_expenditure_average: {
    title: 'Household Expenditures',
    numberOfDecimals: 0,
    prefix: '$',
    suffix: '/yr',
    tooltip:
      'Average annual expenditures for food, beverages, housing, utilities, household operations, household supplies and furnishings, apparel, transportation, health care, entertainment, personal care, personal insurance, education and miscellaneous.'
  } /*,
  census_household_total_expenditure: {
    title: 'Total Household Expenditure',
    numberOfDecimals: 0,
    tooltip: ''
  }*/,
  census_households: {
    title: '# Households',
    numberOfDecimals: 0,
    tooltip:
      'Number of households in the zip code. A household is a person or group of people who occupy a housing unit.'
  },
  census_marriage_never: {
    title: 'Never Married',
    numberOfDecimals: 0,
    suffix: '%',
    tooltip:
      'Percentage of people living in the area who have never been married.'
  },
  census_marriage_now: {
    title: 'Now Married',
    numberOfDecimals: 0,
    suffix: '%',
    tooltip:
      'Percentage of people living in the area who are currently married.'
  },
  census_per_capita_income: {
    title: 'Per Capita Income',
    numberOfDecimals: 0,
    prefix: '$',
    suffix: '/yr',
    tooltip: 'Average individual income of people in the area.'
  },
  census_population: {
    title: 'Population',
    numberOfDecimals: 0,
    suffix: 'ppl',
    tooltip: 'Number of people living within the zipcode.'
  },
  census_population_daytime: {
    title: 'Daytime Population',
    numberOfDecimals: 0,
    suffix: '%',
    tooltip: 'The daytime population in this area.'
  },
  census_population_density: {
    title: 'Population Density',
    numberOfDecimals: 0,
    suffix: 'ppl/mi²',
    tooltip: 'Persons per square mile.'
  },
  census_population_female: {
    title: 'Female Population',
    numberOfDecimals: 0,
    suffix: '%',
    tooltip: 'Percentage of females living within the area.'
  },
  census_population_male: {
    title: 'Male Population',
    numberOfDecimals: 0,
    suffix: '%',
    tooltip: 'Percentage of males living within the area.'
  },
  census_population_seasonal: {
    title: 'Seasonal Population ',
    numberOfDecimals: 0,
    suffix: '%',
    tooltip: 'Seasonal population for this area.'
  },
  census_separated: {
    title: 'Separated',
    numberOfDecimals: 0,
    suffix: '%',
    tooltip:
      'Percentage of people living in the area that are married but separated.'
  },
  census_travel_time_to_work: {
    title: 'Travel Time to Work',
    numberOfDecimals: 0,
    suffix: 'min',
    tooltip: 'The average commute time of workers living in this area.'
  },
  census_widowed: {
    title: 'Widowed',
    numberOfDecimals: 0,
    suffix: '%',
    tooltip: 'Percentage of people living in the area who are widowed.'
  },
  count: {
    title: 'Property Density',
    numberOfDecimals: 0,
    tooltip: 'The count of properties located within the area.'
  },
  crime: {
    title: 'Crime Index',
    numberOfDecimals: 0,
    tooltip:
      'A score that represents the combined risks of rape, murder, assault, robbery, burglary, larceny and vehicle theft compared to the national average of 100. A score of 200 indicates twice the national average total crime risk, while 50 indicates half the national risk. The different types of crime are given equal weight in this score.'
  },
  dom: {
    title: 'DOM',
    suffix: 'days',
    tooltip:
      "Days on market (DOM, alternatively active days on market, market time, or time on market) is a measurement of the age of a real estate listing. The statistic is defined as the total number of days the listing is on the active market before either an offer is accepted or the agreement between real estate broker and seller ends.\
    Generally, properties with a large DOM value will command lower prices than properties with few DOM because a perception exists that the property may be overpriced or less desirable. DOM often factors into developing a pricing strategy. DOM can also be used as a 'thermometer' to gauge the temperature of a housing market.\
    The other use for this statistic is allowing prospective home sellers an idea of how long it may take to sell a property.",
    hasCloseDate: true
  },
  elevation: {
    title: 'Elevation',
    suffix: 'ft',
    numberOfDecimals: 0,
    tooltip: 'Elevation above sea level'
  },
  estimate_accuracy: {
    title: 'Estimate Error',
    numberOfDecimals: 2,
    tooltip: 'Median Estimate Error',
    maxPercentile: 0.9
  },
  estimate_rent_accuracy: {
    title: 'Rental Estimate Error',
    numberOfDecimals: 2,
    tooltip: 'Median Estimate Error (Rental)',
    maxPercentile: 0.9
  },
  estimate_change: {
    title: 'Value Appreciation',
    numberOfDecimals: 0,
    suffix: '%',
    tooltip:
      'The % growth or decline of the estimated value of the properties over the chosen period.'
  },
  estimate_list_ratio: {
    title: 'Estimate/List Price Ratio'
  },
  estimate_rent_ppsf: {
    title: 'Rental $/ft² Estimates',
    prefix: '$',
    suffix: '/ft²',
    comma: true,
    numberOfDecimals: 0,
    tooltip: 'Estimated Rental Price per Square Foot'
  },
  estimate_price: {
    title: 'TopHap Estimates',
    numberOfDecimals: 0,
    prefix: '$',
    tooltip: "TopHap's current estimated property values"
  },
  estimate_ppsf: {
    title: 'TopHap $/ft² Estimates',
    prefix: '$',
    suffix: '/ft²',
    comma: true,
    numberOfDecimals: 0,
    tooltip: "TopHap's Estimated Price per Square Foot"
  },
  estimate_rent_price: {
    title: 'Rental Value Estimates',
    numberOfDecimals: 0,
    prefix: '$',
    suffix: '/mo',
    tooltip: 'Estimated Rental Property Values'
  },
  estimate_sold_ratio: {
    title: 'Home Equity',
    numberOfDecimals: 1,
    suffix: '%',
    hasCloseDate: true,
    tooltip: 'The ratio of the last sale price to the current estimate.'
  },
  garage: {
    title: 'Garage',
    numberOfDecimals: 0,
    tooltip:
      'The number of garage spaces or car port spaces properties have within the area.'
  },
  hazard_co2: {
    title: 'Carbon Monoxide Index',
    numberOfDecimals: 0,
    tooltip:
      'A colorless, odorless, highly poisonous gas formed by the incomplete combustion of carbon or a carbonaceous material, such as gasoline. Index score (100=National Average)'
  },
  hazard_earthquake: {
    title: 'Earthquake Risk',
    numberOfDecimals: 0,
    tooltip:
      'The total earthquake risk. Based on analysis of historical earthquake magnitudes and fault locations. Index score (100=National Average)'
  },
  hazard_hail: {
    title: 'Hail Index',
    numberOfDecimals: 0,
    tooltip:
      'The total risk of damaging hailstorms. Based on analysis of historical hail frequency and severity. Index score (100=National Average)'
  },
  hazard_hurricane: {
    title: 'Hurricane Index',
    numberOfDecimals: 0,
    tooltip:
      'The total hurricane risk. Based on analysis of historical hurricane tracks and intensity. Index score (100=National Average)'
  },
  hazard_lead: {
    title: 'Lead Index',
    numberOfDecimals: 0,
    tooltip:
      "A metallic element used in products like solder and paint. Lead's presence in the air may be particularly harmful to the health of infants and children. Index score (100=National Average)"
  },
  hazard_no2: {
    title: 'NO2 Index',
    numberOfDecimals: 0,
    tooltip:
      'Poisonous brown gases, often found in auto exhaust fumes. It is a primary contributor to smog. Index score (100=National Average)'
  },
  hazard_ozone: {
    title: 'Ozone Index',
    numberOfDecimals: 0,
    tooltip:
      'An invisible gas that irritates and impairs breathing. Index score (100=National Average).'
  },
  hazard_particules: {
    title: 'Particulate Matter Index',
    numberOfDecimals: 0,
    tooltip:
      'Fine particles of pollutants which tend to reduce visibility and invade the lungs deeply. Index score (100=National Average)'
  },
  hazard_pollution: {
    title: 'Air Pollution Index',
    numberOfDecimals: 0,
    tooltip:
      'A score that represents the relative air quality by combining indices of Ozone, Carbon Monoxide, Lead, Nitrogen Oxide, and Particulate matter and comparing to the national average of 100. A score of 200 indicates twice the presence of air pollutants than the national average, while 50 indicates half the presence. The different types of pollution are given equal weight in this score.'
  },
  hazard_tornado: {
    title: 'Tornado Index',
    numberOfDecimals: 0,
    tooltip:
      'The total tornado risk. Based on analysis of historical tornado tracks and intensity. (100=National Average)'
  },
  hazard_weather: {
    title: 'Weather Risk',
    numberOfDecimals: 0,
    tooltip:
      'The total risk from various storm types (hurricanes, tornadoes, damaging hailstorms and damaging wind storms). Index score (100=National Average)'
  },
  hazard_wind: {
    title: 'Wind Index',
    numberOfDecimals: 0,
    tooltip:
      'The total risk of severe winds. Based on analysis of the frequency and severity of historical damaging windstorms, typically associated with thunderstorms. Index score (100=National Average)'
  },
  hoa_fee: {
    title: 'HOA fee',
    numberOfDecimals: 0,
    prefix: '$',
    suffix: '/mo',
    tooltip:
      'Monthly dues paid to the HOA. A homeowner association (or homeowners’ association, abbreviated HOA, sometimes referred to as a property owners’ association or POA) is a private association often formed by a real estate developer for the purpose of marketing, managing, and selling homes and lots in a residential subdivision.'
  },
  list_vs_sold: {
    title: 'Sold vs List',
    numberOfDecimals: 0,
    suffix: '%',
    tooltip: 'Sell Price to List Price Ratio.',
    hasCloseDate: true,
    removeZero: true
  },
  living_area: {
    title: 'Living Area',
    suffix: 'ft²',
    tooltip: 'Property Living Area (square feet)'
  },
  lot_size_acres: {
    title: 'Lot Size',
    numberOfDecimals: 2,
    suffix: 'ac',
    tooltip: 'Property Lot Size (acres)'
  },
  noise: {
    title: 'Noise',
    numberOfDecimals: 0,
    suffix: 'dB',
    tooltip: 'Road and Aviation Noise - Decibels'
  },
  owner_occupied: {
    title: 'Owner-Occupied',
    tooltip:
      'Percentage of properties within the area that are derived to be owner-occupied.',
    aggregation: {
      suffix: '%',
      numberOfDecimals: 0
    },
    parcel: {
      valueType: 'boolean'
    }
  },
  ownership_days: {
    title: 'Ownership Time',
    suffix: 'days',
    numberOfDecimals: 0,
    tooltip: 'The number of time since the last sale date.'
  },
  permits_count: {
    title: 'Permits Count',
    numberOfDecimals: 0,
    tooltip: 'Number of issued permits within the area.'
  },
  permits_value: {
    title: 'Permits Value',
    numberOfDecimals: 0,
    prefix: '$',
    tooltip: 'Declared value of issued permits within the area.'
  },
  pool: {
    title: 'Has Pool',
    tooltip: 'Percentage of properties that have a pool within the area.',
    aggregation: {
      numberOfDecimals: 0,
      suffix: '%',
      valueType: 'number'
    },
    parcel: {
      valueType: 'boolean'
    }
  },
  precipitation: {
    title: 'Rainfall',
    numberOfDecimals: 0,
    suffix: 'in',
    tooltip: 'Combined average annual rainfall and snowfall in inches.'
  },
  price_per_sqft: {
    title: 'Last Sale $/ft²',
    prefix: '$',
    suffix: '/ft²',
    comma: true,
    numberOfDecimals: 0,
    tooltip: 'Estimated Last Sale Price per Square Foot.'
  },
  profit: {
    title: 'Profitability',
    prefix: '$',
    numberOfDecimals: 2,
    tooltip:
      'The difference between the last sold price and the previous sold price.'
  },
  property_use: {
    title: 'Property Type',
    valueType: 'string',
    tooltip: 'The types of properties within this area.'
  },
  rent_yield: {
    title: 'Gross Rental Yield',
    suffix: '%',
    numberOfDecimals: 0,
    tooltip:
      'Gross rental yield is calulated by taking the "estimated annual rental income" and dividing by the "estimated property value"'
  },
  sale_price: {
    title: 'Last Sale Price',
    prefix: '$',
    numberOfDecimals: 0,
    tooltip: 'Last Sale price of the property.'
  },
  school_college_bound: {
    title: 'College Bound',
    suffix: '%',
    numberOfDecimals: 0,
    tooltip:
      'This value represents the % of seniors who graduate from this school.'
  },
  school_reviewer_rating_avg: {
    title: 'Reviewer Rating Avg',
    numberOfDecimals: 1,
    tooltip:
      'A numeric rating given by the reviewer to support their comments. (1 = Lowest, 5 = Highest, 0 = No Rating)'
  },
  school_students_number: {
    title: 'Number of Students',
    numberOfDecimals: 0,
    suffix: 'ppl',
    tooltip:
      'Exact student enrollment, phone-verified. The number of students may include charter or specialty programs located on the same physical campus as the main school.'
  },
  school_students_per_grade: {
    title: 'Students per Grade',
    numberOfDecimals: 0,
    suffix: 'ppl',
    tooltip: 'The ratio of students per grade within the school.'
  },
  school_students_per_teacher: {
    title: 'Students per Teacher',
    numberOfDecimals: 0,
    suffix: 'ppl',
    tooltip:
      'The ratio of teachers to students within the school. If there is insufficient data from the vendor, “Not Reported” will be displayed.'
  },
  school_teachers_number: {
    title: 'Number of Teachers',
    numberOfDecimals: 0,
    suffix: 'ppl',
    tooltip: 'Number of full-time classroom teachers at an institution.'
  },
  school_test_score_rating: {
    title: 'Test Score Rating',
    numberOfDecimals: 1,
    tooltip:
      'School Test Score Rating. The rating is based purely on the test score performance of each school.  It is based on a scale of 0-5, 5 being best.'
  },
  slope: {
    title: 'Lot Slope',
    suffix: '%',
    numberOfDecimals: 0,
    tooltip:
      'The average slope percentage of the lot. This is a good indicator of whether the lot is flat or steep.'
  },
  sold_ago: {
    title: 'Ownership Time',
    suffix: 'days',
    numberOfDecimals: 2,
    tooltip: 'Current Ownership Time (days)'
  },
  stories: {
    title: 'Stories',
    numberOfDecimals: 0,
    tooltip:
      'The number of levels, floors, or stories that buildings have within the area.'
  },
  tax: {
    title: 'Taxes',
    prefix: '$',
    numberOfDecimals: 2,
    tooltip: 'Last paid property tax.'
  },
  temperature: {
    title: 'Temperature',
    suffix: '°F',
    numberOfDecimals: 1,
    tooltip: 'Seasonal temperature sampled over multiple years.'
  },
  turnover: {
    title: 'Turnover',
    hasCloseDate: true,
    suffix: '%',
    numberOfDecimals: 2,
    tooltip:
      'The percentage of properties within the area that have changed ownership in the selected time period.'
  },
  unique_zones: {
    title: 'Unique Zones',
    valueType: 'string',
    tooltip:
      'Homes grouped together by their common neighborhoods, school zones, zip codes, etc...'
  },
  usable_area: {
    title: 'Lot Usable Space',
    suffix: '%',
    numberOfDecimals: 2,
    tooltip:
      'The percentage of the lot currently not utilized by the footprint of the property. Footprint is calculated as Living area / # Stories / Lot Size.'
  },
  walkability: {
    title: 'Walkability',
    numberOfDecimals: 0,
    tooltip:
      'National Walkability Index. Walkability depends upon characteristics of the built environment that influence the likelihood of walking being used as a mode of travel.'
  },
  zoned_code: {
    title: 'Land Use',
    valueType: 'string',
    tooltip: 'County specific zoning code.'
  }
}

export function getAnalyticsMetricData(
  metric: TopHap.AnalyticsMetric,
  level: 'aggregation' | 'parcel'
) {
  const data = descriptiveData[metric]
  const additional = level === 'aggregation' ? data.aggregation : data.parcel
  return {
    ...data,
    ...(additional || {})
  }
}

export function formatAnalyticsMetric(
  metric: TopHap.AnalyticsMetric,
  value: string | number,
  level: 'aggregation' | 'parcel'
): string {
  const dataMapping = getAnalyticsMetricData(metric, level)
  const valueType = dataMapping.valueType || 'number'
  let formatted

  if (valueType === 'boolean') {
    formatted = String(value)
  } else if (valueType === 'number' && dataMapping.suffix === 'days') {
    formatted = formatDays(Number(value))
  } else {
    if (valueType === 'number') {
      formatted = dataMapping.comma
        ? commaNumber(
            isNil(dataMapping.numberOfDecimals)
              ? value
              : Number(value).toFixed(dataMapping.numberOfDecimals)
          )
        : numAbbr.abbreviate(
            isNil(dataMapping.numberOfDecimals)
              ? value
              : Number(value).toFixed(dataMapping.numberOfDecimals),
            1
          )
    } else {
      formatted = value
    }

    if (dataMapping.prefix) formatted = dataMapping.prefix + formatted
    if (dataMapping.suffix) formatted = formatted + ' ' + dataMapping.suffix
  }

  return formatted
}

function formatDays(days: number) {
  const year = Math.floor(days / 365)
  const month = Math.floor((days - year * 365) / 30)
  const day = days - year * 365 - month * 30

  let formatted = ''
  if (year > 0) formatted = formatted + year + 'Y '
  if (month > 0) formatted = formatted + month + 'M '
  if (day > 0) formatted = formatted + Math.round(day) + 'D'

  return formatted
}

export const propertyData: {
  [key in TopHap.PropertyMetric]: any
} = {
  Price: {
    title: 'Price',
    abbreviate: true
  },
  PricePerSqft: {
    title: 'Price / ft²',
    abbreviate: true
  },
  LivingSqft: {
    title: 'Living Area',
    abbreviate: true
  },
  LotAcres: {
    title: 'Lot Size',
    abbreviate: true
  },
  ParkingCount: {
    title: 'Garage Spaces',
    abbreviate: false
  },
  BedsCount: {
    title: 'Bedrooms',
    abbreviate: false
  },
  BathsDecimal: {
    title: 'Bathrooms',
    abbreviate: false
  },
  YearBuilt: {
    title: 'Year Built',
    abbreviate: false
  },
  count: {
    title: 'Properties Count',
    abbreviate: true
  }
}

export function formatPropertyMetric(
  metric: TopHap.PropertyMetric,
  value: number | string
): string {
  return propertyData[metric].abbreviate
    ? numAbbr.abbreviate(value, value > 1000000 ? 2 : 1)
    : value
}

export const sortOptions: {
  name: string
  value: TopHap.PropertySortKey
}[] = [
  {
    name: 'Recommended',
    value: 'id'
  },
  {
    name: 'Price',
    value: 'list_price'
  },
  {
    name: 'Beds',
    value: 'beds'
  },
  {
    name: 'Baths',
    value: 'baths'
  },
  {
    name: 'Square Feet',
    value: 'sqft'
  },
  {
    name: '$/Square Feet',
    value: 'price_sqft'
  },
  {
    name: 'Time on TopHap',
    value: 'list_date'
  },
  {
    name: 'Last Update',
    value: 'status_timestamp'
  },
  {
    name: 'Upside',
    value: 'valuation'
  },
  {
    name: 'Year Built',
    value: 'year_built'
  },
  {
    name: 'Construction Activity',
    value: 'activity'
  }
]

export const propertyStatus: {
  [key in TopHap.PropertyStatus]: any
} = {
  New: {
    color: '#00c853',
    title: 'New'
  },
  Active: {
    color: '#6651f5',
    title: 'Active'
  },
  Pending: {
    color: '#f5a623',
    title: 'Pending'
  },
  Sold: {
    color: '#d43f51',
    title: 'Sold'
  },
  Inactive: {
    color: '#a9a9a9',
    // title: 'Off-Market'
    title: ''
  }
}
