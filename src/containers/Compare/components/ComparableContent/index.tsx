import React from 'react'
import cn from 'classnames'
import get from 'lodash/get'
import isNaN from 'lodash/isNaN'
import isNil from 'lodash/isNil'
import startCase from 'lodash/startCase'

import Tooltip from 'components/Tooltip'

import {
  formatAnalyticsMetric,
  getAnalyticsMetricData
} from 'consts/data_mapping'
import categories, {
  AnalyticsCategory
} from 'containers/MapView/components/AnalyticsLayerPanel/categories'

import SvgCollapse from 'assets/images/icons/expand_less.svg'
import SvgExpand from 'assets/images/icons/expand_more.svg'

import styles from './styles.scss?type=global'

interface CategoryProps {
  category: AnalyticsCategory
  comparable: TopHap.Comparable
  isExpanded: boolean
  expand: (expanded: boolean) => void
  primary: TopHap.Comparable
  isPrimary?: boolean
}

function Category({
  category,
  comparable,
  isExpanded,
  expand,
  primary,
  isPrimary
}: CategoryProps) {
  function _renderMetric(metric: TopHap.AnalyticsMetric) {
    const metricData = getAnalyticsMetricData(
      metric,
      comparable.place.place_type[0] === 'address' ? 'parcel' : 'aggregation'
    )
    const primaryMetricData = getAnalyticsMetricData(
      metric,
      comparable.place.place_type[0] === 'address' ? 'parcel' : 'aggregation'
    )

    const value = get(comparable.data.analytics, metric as string)
    const primaryValue = get(primary.data.analytics, metric as string)

    function _renderOption(key: string, value: any, primaryValue: any) {
      const diff =
        isPrimary ||
        isNil(value) ||
        isNil(primaryValue) ||
        (metricData.valueType && metricData.valueType !== 'number') ||
        (primaryMetricData.valueType &&
          primaryMetricData.valueType !== 'number')
          ? undefined
          : value - primaryValue

      return (
        <div key={metric + key} className='th-metric'>
          {isPrimary && (
            <div className='th-metric-title'>
              <Tooltip tooltip={metricData.tooltip} trigger='hover'>
                {metricData.title}{' '}
                {key ? (
                  <small>({startCase(key.replace(/_/g, ' '))})</small>
                ) : null}
              </Tooltip>
            </div>
          )}
          <div className='th-metric-value'>
            <div>
              {isNil(value) || isNaN(value)
                ? '-'
                : formatAnalyticsMetric(
                    metric,
                    value,
                    comparable.place.place_type[0] === 'address'
                      ? 'parcel'
                      : 'aggregation'
                  )}
            </div>
            {!isNil(diff) && !isNaN(diff) ? (
              <div
                className='th-metric-diff'
                style={{ color: diff >= 0 ? '#20cb4c' : '#ff0000' }}
              >
                <Tooltip
                  tooltip={formatAnalyticsMetric(
                    metric,
                    diff,
                    comparable.place.place_type[0] === 'address'
                      ? 'parcel'
                      : 'aggregation'
                  )}
                  trigger='hover'
                >
                  {Math.round((diff * 100) / primaryValue)} %
                </Tooltip>
              </div>
            ) : null}
          </div>
        </div>
      )
    }

    if (value && typeof value === 'object') {
      return Object.keys(value).map(key =>
        _renderOption(key, get(value, key), get(primaryValue, key))
      )
    } else {
      return _renderOption('', value, primaryValue)
    }
  }

  function handleExpand() {
    expand(!isExpanded)
  }

  return (
    <div className={cn('th-category', { 'th-expanded': isExpanded })}>
      <div className='th-category-title' onClick={handleExpand}>
        <span>{category.title}</span>
        {isExpanded ? <SvgCollapse /> : <SvgExpand />}
      </div>
      <div className='th-category-content'>
        {category.items.map(metric => _renderMetric(metric))}
      </div>
    </div>
  )
}

interface ComparableContentProps {
  comparable: TopHap.Comparable
  expandedCategories: string[]
  expandCategory: (categoryId: string, expanded: boolean) => void
  primary: TopHap.Comparable
  isPrimary?: boolean
}

export default function ComparableContent({
  comparable,
  expandedCategories,
  expandCategory,
  isPrimary,
  primary
}: ComparableContentProps) {
  return (
    <div className={cn('th-comparable-content', { 'th-primary': isPrimary })}>
      {categories.map(category => (
        <Category
          key={category.id}
          category={category}
          comparable={comparable}
          isExpanded={expandedCategories.includes(category.id)}
          expand={expanded => expandCategory(category.id, expanded)}
          primary={primary}
          isPrimary={isPrimary}
        />
      ))}

      <style jsx>{styles}</style>
    </div>
  )
}
