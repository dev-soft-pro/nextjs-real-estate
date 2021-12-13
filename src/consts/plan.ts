export type Plan = {
  id: string
  color: string
  monthlyPrice: number
  name: string
  recommend?: boolean
  period: 'monthly' | 'annual'
  role: 'free' | 'pro' | 'advanced'
}

const freePlan = {
  color: '#f74875',
  monthlyPrice: 0,
  name: 'Basic',
  role: 'free'
}

export default {
  month: {
    free: {
      ...freePlan,
      id: '',
      period: 'monthly'
    } as Plan,
    pro: {
      id: 'plan_GtCE4b7nkHdnIk',
      color: '#ffcc00',
      monthlyPrice: 55,
      name: 'Pro',
      recommend: true,
      period: 'monthly',
      role: 'pro'
    } as Plan,
    advanced: {
      id: 'plan_GtCGT9UKZBqecF',
      color: '#11dd80',
      monthlyPrice: 155,
      name: 'Expert',
      period: 'monthly',
      role: 'advanced'
    } as Plan
  },
  annual: {
    free: {
      ...freePlan,
      id: '',
      period: 'annual'
    } as Plan,
    pro: {
      id: 'plan_GtCI5mE1ieJHLC',
      color: '#ffcc00',
      monthlyPrice: 45,
      recommend: true,
      name: 'Pro',
      period: 'annual',
      role: 'pro'
    } as Plan,
    advanced: {
      id: 'plan_GtCJpJ6GP8nrVv',
      color: '#11dd80',
      monthlyPrice: 126,
      name: 'Expert',
      period: 'annual',
      role: 'advanced'
    } as Plan
  }
}

export const id2Plan: { [key: string]: string } = {
  plan_GtCE4b7nkHdnIk: 'month.pro',
  plan_GtCGT9UKZBqecF: 'month.advanced',
  plan_GtCI5mE1ieJHLC: 'annual.pro',
  plan_GtCJpJ6GP8nrVv: 'annual.advanced'
}

export const features = [
  {
    id: 'search',
    title: 'Search',
    items: [
      {
        id: 'PROPERTIES',
        title: 'Properties',
        requireRole: 'free',
        tooltip: 'For Sale, For Rent, On Market and Off Market'
      },
      {
        id: 'NEIGHBORHOODS',
        title: 'Neighborhoods',
        requireRole: 'free',
        tooltip: 'Search for properties by neighborhood names'
      },
      {
        id: 'SCHOOLS',
        title: 'Schools',
        requireRole: 'free',
        tooltip: 'Search for properties by school attendance zones'
      }
    ]
  },
  {
    id: 'market_analytics',
    title: 'Market Analytics',
    items: [
      {
        id: 'TOPHAP_AVM',
        title: 'TopHap AVM',
        requireRole: 'free',
        tooltip:
          "TopHap's propriatary Automated Valuation Model (AVM) responsible for calculating accurate values for current, historical and future sale and rent estimates"
      },
      {
        id: 'REGIONAL_VALUE_BREAKDOWN',
        title: 'Regional Value Breakdown',
        requireRole: 'pro',
        tooltip:
          'Price and Price per Square Foot, Sale Estimate and Rental Estimates'
      },
      {
        id: 'MARKET_INSIGHTS',
        title: 'Market Insights',
        requireRole: 'pro',
        tooltip:
          'Sold vs List, DOM, HOA, Ownership Time, Turnover, Owner-Occupied'
      },
      {
        id: 'PROPERTY_INSIGHTS',
        title: 'Property Insights',
        requireRole: 'pro',
        tooltip:
          'Living Area, Bedrooms Count, Bathrooms Count, Lot Size, Lot Slope, Lot Usability, Grages, Pool, Stories, Property Age, Property Type'
      },
      {
        id: 'REGIONAL_INSIGHTS',
        title: 'Regional Insights',
        requireRole: 'pro',
        tooltip:
          'Elevation, Rainfall, Historic Temperature, Crime Index, Walkability, Noise, Land Use, Unique Zones, Property Density'
      },
      {
        id: 'COMMUNITY_DATA',
        title: 'Community Data',
        requireRole: 'pro',
        tooltip:
          'Population, Median Age, Educational Climate Index, Drive Time To Work, Blue Color Occupation, White Color Occupation, Employee Salary, Household Size, Household Income, Household Expenditures, Disposable Household Income, Mariage Statistics, Population Density, Male/Female Population, Day Time Population, Seasonal Population'
      },
      {
        id: 'HAZARDS_DATA',
        title: 'Hazards',
        requireRole: 'pro',
        tooltip:
          'Earthquake Risk, Weather Risk, Hail Index, Hurricane Index, Lead Index, NO2 Index, Ozone Index, Particulate Matter Index, Air Polution Index, Tornado Index, Carbon Monoxide Index, Wind Index'
      }
    ]
  },
  {
    id: 'investment_analytics',
    title: 'Investment Analytics',
    items: [
      {
        id: 'PROPERTY_VALUE_APPRECIATION',
        title: 'Property Value Appreciation YoY',
        requireRole: 'advanced',
        tooltip: 'Visualize property value appreciation over different periods'
      },
      {
        id: 'GROSS_RENTAL_YIELD',
        title: 'Gross Rental Yield',
        requireRole: 'advanced',
        tooltip: 'See estimated gross rental yield across all areas'
      },
      {
        id: 'BUILDING_PERMIT_ANALYTICS',
        title: 'Building Permit Analytics',
        requireRole: 'advanced',
        tooltip: 'Analyze issued permits'
      },
      {
        id: 'REGIONAL_PROFITABILITY',
        title: 'Regional Profitability Anlaysis',
        requireRole: 'advanced',
        tooltip: 'Identify hot spots of flipper activity'
      },
      {
        id: 'TAX_INSIGHTS',
        title: 'Tax Insights',
        requireRole: 'pro',
        tooltip: 'Compare neighborhood property owner tax liabilities'
      },
      {
        id: 'PROPERTY_VALUE_FORECAST',
        title: 'Property Value Forecast',
        requireRole: 'advanced',
        tooltip: 'Visualize 12 and 24 month property value forecasts'
      }
    ]
  },
  {
    id: 'property_analytics',
    title: 'Property Analytics',
    items: [
      {
        id: 'LISTING_DETAILS',
        title: 'Listing Details',
        requireRole: 'free',
        tooltip: ''
      },
      {
        id: 'PROPERTY_CHARACTERISTICS',
        title: 'Property Details',
        requireRole: 'free',
        tooltip: ''
      },
      {
        id: 'PROPERTY_VALUE',
        title: 'Property Value',
        requireRole: 'free',
        tooltip: ''
      },
      {
        id: 'PROPERTY_VALUE_HISTORY',
        title: 'Property Value History',
        requireRole: 'pro',
        tooltip: ''
      },
      {
        id: 'PROPERTY_VALUE_FORECAST_ENGINE',
        title: 'Property Value Forecast Engine',
        requireRole: 'advanced',
        tooltip: ''
      },
      {
        id: 'PROPERTY_IMPROVEMENT_CALCULATOR',
        title: 'Property Improvement Calculator',
        requireRole: 'pro',
        tooltip: ''
      },
      {
        id: 'TRANSACTION_HISTORY',
        title: 'Transaction History',
        requireRole: 'pro',
        tooltip: ''
      },
      {
        id: 'PERMIT_HISTORY',
        title: 'Permit History',
        requireRole: 'pro',
        tooltip: ''
      },
      {
        id: 'TAX_HISTORY',
        title: 'Tax History',
        requireRole: 'pro',
        tooltip: ''
      },
      {
        id: 'OWNERSHIP_HISTORY',
        title: 'Ownership History',
        requireRole: 'advanced',
        tooltip: ''
      },
      {
        id: 'LOT_TOPOGRAPHY_3D',
        title: '3D Lot Topography',
        requireRole: 'pro',
        tooltip: ''
      },
      {
        id: 'LOT_USABILITY_ANALYSIS',
        title: 'Lot Usability Analysis',
        requireRole: 'pro',
        tooltip: ''
      },
      {
        id: 'NEIGHBORHOOD_HISTOGRAM',
        title: 'Neighborhood Histogram',
        requireRole: 'pro',
        tooltip: ''
      },
      {
        id: 'PROPERTY_DETAIL_PDF_EXPORT',
        title: 'PDF Export',
        requireRole: 'pro',
        tooltip: ''
      }
    ]
  },
  {
    id: 'tophap_cma_plus',
    title: 'TopHap CMA+',
    items: [
      {
        id: 'COMPARE_PROPERTIES',
        title: 'Compare Properties',
        requireRole: 'pro'
      },
      {
        id: 'COMPARE_REGIONS',
        title: 'Compare Regions',
        requireRole: 'pro'
      },
      {
        id: 'COMPARE_VALUE_HISTORY',
        title: 'Compare Property Value History',
        requireRole: 'advanced',
        tooltip: 'Estimate, YoY Chnage, Gross Rental Yield'
      },
      {
        id: 'COMPARE_VALUE_FORECAST',
        title: 'Compare Property Value Forecasts',
        requireRole: 'advanced',
        tooltip: 'Estimate, YoY Chnage, Gross Rental Yield'
      },
      {
        id: 'COMPARE_MARKET_CONDITIONS',
        title: 'Compare Market Conditions',
        requireRole: 'advanced',
        tooltip:
          'Health, Inventory, Sold Count, CDOM, Median Price, Median Price per Square Foot, Turnover %'
      }
    ]
  },
  {
    id: 'tools',
    title: 'Tools',
    items: [
      {
        id: 'MAP_DRAWING_TOOL',
        title: 'Map drawing Tool',
        requireRole: 'free'
      },
      {
        id: 'LOT_TOPOGRAPHY_3D',
        title: '3D Lot Topography',
        requireRole: 'pro'
      },
      {
        id: 'EXPORT_PDF',
        title: 'Export PDF',
        requireRole: 'pro'
      },
      {
        id: 'EXPORT_CSV',
        title: 'Export CSV',
        requireRole: 'advanced'
      }
    ]
  }
]

export const roleOrders: { [key in TopHap.UserRole]: number } = {
  free: 0,
  pro: 1,
  advanced: 2,
  enterprise: 3
}
