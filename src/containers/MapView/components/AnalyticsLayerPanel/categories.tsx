import SvgCensus from 'assets/images/icons/categories/census.svg'
import SvgInvestment from 'assets/images/icons/categories/investment.svg'
import SvgMarket from 'assets/images/icons/categories/market.svg'
import SvgPrice from 'assets/images/icons/categories/price.svg'
import SvgProperty from 'assets/images/icons/categories/property.svg'
import SvgRegion from 'assets/images/icons/categories/region.svg'
import SvgSchool from 'assets/images/icons/categories/school.svg'
import SvgWarning from 'assets/images/icons/categories/warning.svg'

export type AnalyticsCategory = {
  Icon: React.ComponentClass
  id: string
  color: string
  title: string
  items: TopHap.AnalyticsMetric[]
}

const categories: AnalyticsCategory[] = [
  {
    id: 'value',
    color: '#6651F5',
    title: 'Value',
    Icon: SvgPrice,
    items: [
      'estimate_price',
      'estimate_ppsf',
      'estimate_change',
      'estimate_rent_price',
      'estimate_rent_ppsf' /*,
      'estimate_accuracy',
      'estimate_rent_accuracy'*/
    ]
  },
  {
    id: 'property',
    color: '#F5A623',
    title: 'Property',
    Icon: SvgProperty,
    items: [
      'living_area',
      'bedrooms',
      'bathrooms',
      'lot_size_acres',
      'slope',
      'usable_area',
      'garage',
      'pool',
      'stories',
      'age',
      'property_use',
      'hoa_fee'
    ]
  },
  {
    id: 'region',
    color: '#FBE800',
    title: 'Region',
    Icon: SvgRegion,
    items: [
      'walkability',
      'noise',
      'census_travel_time_to_work',
      'census_population_daytime',
      'census_population_seasonal',
      'elevation',
      'precipitation',
      'temperature',
      'crime',
      'zoned_code',
      'unique_zones',
      'count'
    ]
  },
  {
    id: 'hazards',
    color: '#E30000',
    title: 'Hazards',
    Icon: SvgWarning,
    items: [
      'hazard_earthquake',
      'hazard_weather',
      'hazard_hail',
      'hazard_hurricane',
      'hazard_lead',
      'hazard_no2',
      'hazard_ozone',
      'hazard_particules',
      'hazard_pollution',
      'hazard_tornado',
      'hazard_co2',
      'hazard_wind'
    ]
  },
  {
    id: 'market',
    color: '#31BCDA',
    title: 'Market',
    Icon: SvgMarket,
    items: [
      'list_vs_sold',
      'dom',
      'ownership_days',
      'turnover',
      'owner_occupied'
    ]
  },
  {
    id: 'investment',
    color: '#E158EE',
    title: 'Investment',
    Icon: SvgInvestment,
    items: [
      'rent_yield',
      'estimate_sold_ratio',
      'tax',
      'sale_price',
      'price_per_sqft',
      'profit',
      'permits_count',
      'permits_value'
    ]
  },
  {
    id: 'community',
    color: '#9D58FF',
    title: 'Community',
    Icon: SvgCensus,
    items: [
      'census_population',
      'census_age_median',
      'census_collar_blue',
      'census_collar_white',
      'census_employee_salary_average',
      'census_employee_salary_median',
      'census_family_size',
      'census_per_capita_income',
      'census_households',
      'census_household_size',
      'census_household_income_median',
      'census_household_total_expenditure_average',
      'census_household_disposable_income_median',
      /*'census_household_income_average',*/
      /*'census_household_total_expenditure',*/
      'census_marriage_never',
      'census_marriage_now',
      'census_divorced',
      'census_widowed',
      'census_separated',
      'census_population_density',
      'census_population_female',
      'census_population_male'
    ]
  },
  {
    id: 'school',
    color: '#A0D276',
    title: 'School',
    Icon: SvgSchool,
    items: [
      'school_reviewer_rating_avg',
      'school_test_score_rating',
      'census_educational_climate_index',
      'school_students_number',
      'school_students_per_grade',
      'school_students_per_teacher',
      'school_teachers_number',
      'school_college_bound'
    ]
  }
]

export default categories
