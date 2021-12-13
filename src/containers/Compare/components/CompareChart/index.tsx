import React, { useMemo, useState } from 'react'
import cn from 'classnames'
import dayjs, { OpUnitType } from 'dayjs'
import isEqual from 'lodash/isEqual'
import ResizeDetector from 'react-resize-detector'

import Button from 'components/Button'
import Checkbox from 'components/Checkbox'
import OverlaySpinner from 'components/OverlaySpinner'
import Select, { Option } from 'components/Select'
import Tabs from 'components/Tabs'
import { BREAK_MD } from 'consts'
import { logEvent } from 'services/analytics'
import LineChart from './LineChart'
import styles from './styles.scss?type=global'

interface CompareChartProps {
  comparables: TopHap.Comparable[]
  colors: { [key: string]: string }
  dateOption: [number, OpUnitType]
  excludes?: { [key: string]: boolean }
  loading?: boolean
  showAccuracy?: boolean
  type: TopHap.CompareMetricGroup
  metric: TopHap.CompareMetric
  onDateOptionChange?: (dateOption: [number, OpUnitType]) => void
  onTypeChange?: (type: TopHap.CompareMetricGroup) => void
  onMetricChange?: (metric: TopHap.CompareMetric) => void
}

const DATE_OPTIONS: {
  label: string
  value: [number, OpUnitType]
}[] = [
  { label: '1W', value: [-1, 'w'] },
  { label: '2W', value: [-2, 'w'] },
  { label: '1M', value: [-1, 'M'] },
  { label: '2M', value: [-2, 'M'] },
  { label: '3M', value: [-3, 'M'] },
  { label: '6M', value: [-6, 'M'] },
  { label: '1Y', value: [-1, 'y'] },
  { label: '2Y', value: [-2, 'y'] },
  { label: '5Y', value: [-5, 'y'] },
  { label: 'ALL', value: [0, 'y'] },
  { label: '+1Y', value: [1, 'y'] },
  { label: '+2Y', value: [2, 'y'] }
]

const metrics: {
  type: TopHap.CompareMetricGroup
  metric: TopHap.CompareMetric
  title: string
}[] = [
  { type: 'Estimate', metric: 'Estimate', title: 'Estimate' },
  { type: 'Estimate', metric: '$/ft² Estimate', title: '$/ft² Estimate' },
  { type: 'Estimate', metric: '% Change', title: '% Change' },
  { type: 'Estimate', metric: 'Rental Yield', title: 'Rental Yield' },
  { type: 'Market', metric: 'Health', title: 'Health' },
  {
    type: 'Market',
    metric: 'Inventory',
    title: 'Inventory'
  },
  { type: 'Market', metric: 'Sold Count', title: 'Sold Count' },
  { type: 'Market', metric: 'CDOM', title: 'CDOM' },
  { type: 'Market', metric: 'Median Price', title: 'Median Price' },
  { type: 'Market', metric: 'Median $/ft²', title: 'Median $/ft²' },
  { type: 'Market', metric: 'Turnover', title: 'Turnover (%)' }
]

export default function CompareChart({
  colors,
  dateOption,
  excludes,
  loading,
  showAccuracy,
  type,
  metric,
  onDateOptionChange,
  onTypeChange,
  onMetricChange,
  ...props
}: CompareChartProps) {
  const comparables = useMemo(() => {
    return props.comparables.filter(e => !(excludes && excludes[e.place.id]))
  }, [props.comparables, excludes])
  const [width, setWidth] = useState(0)
  const dateOptions = useMemo(() => {
    if (type === 'Estimate') {
      return DATE_OPTIONS.slice(3)
    } else {
      return DATE_OPTIONS
    }
  }, [type])

  const data = useMemo(() => {
    const min = 946684800000 // 2000
    const o: any = {}
    if (type === 'Estimate') {
      comparables.forEach(comparable => {
        comparable.estimate
          .filter(e => e.key >= min)
          .map(e => {
            if (!o[e.key]) {
              o[e.key] = {
                date: e.key
              }
            }

            let value
            if (metric === 'Estimate') {
              value = e.price
            } else if (metric === '$/ft² Estimate') {
              value = e.ppsf
            } else if (metric === '% Change') {
              value = e.percent
            } else if (metric === 'Rental Yield') {
              value = e.rental_yield
            }

            o[e.key][comparable.place.id] = {
              value,
              accuracy: e.accuracy,
              range:
                e.accuracy && value
                  ? [
                      value * (1 + e.accuracy.min / 100),
                      value * (1 + e.accuracy.max / 100)
                    ]
                  : []
            }
          })
      })
    } else {
      const max = dayjs
        .utc()
        .startOf(_getInterval(dateOption))
        .valueOf()
      comparables.forEach(comparable => {
        comparable.market
          .filter(e => e.key >= min && e.key < max)
          .map(e => {
            if (!o[e.key]) {
              o[e.key] = {
                date: e.key
              }
            }

            let value
            if (metric === 'Health') {
              value = e.activeCount / (e.soldCount + 1)
            } else if (metric === 'Inventory') {
              value = e.activeCount
            } else if (metric === 'Sold Count') {
              value = e.soldCount
            } else if (metric === 'CDOM') {
              value = e.cdom
            } else if (metric === 'Median Price') {
              value = e.price
            } else if (metric === 'Median $/ft²') {
              value = e.ppsf
            } else if (metric === 'Turnover') {
              value = (e.soldCount / comparable.data.count) * 100
            }

            o[e.key][comparable.place.id] = {
              value,
              accuracy: { min: 0, max: 0 },
              range: []
            }
          })
      })
    }

    let month: { min?: number; max?: number } = {}
    if (dateOption[0] > 0) {
      month = {
        min: dayjs().valueOf(),
        max: dayjs()
          .add(dateOption[0], dateOption[1])
          .valueOf()
      }
    } else if (dateOption[0] < 0) {
      month = {
        min: dayjs()
          .subtract(Math.abs(dateOption[0]), dateOption[1])
          .valueOf(),
        max: dayjs().valueOf()
      }
    }

    return (Object.values(o) as any[])
      .filter(e => {
        if (month.min && e.date < month.min) return false
        if (month.max && e.date > month.max) return false
        return true
      })
      .sort((a, b) => a.date - b.date)
  }, [type, comparables, metric, dateOption])

  function _getInterval(dateOption: [number, OpUnitType]) {
    let interval: 'month' | 'week' | 'day' = 'month'
    if (dateOption[0] < 0) {
      if (dateOption[1] === 'w') {
        interval = 'day'
      } else if (dateOption[1] === 'M') {
        if (Math.abs(dateOption[0]) <= 2) {
          interval = 'week'
        }
      }
    }

    return interval
  }

  function handleTabChange(_ev: any, value?: any) {
    if (onTypeChange) onTypeChange(value)
  }

  function handleMetricChange(type: TopHap.CompareMetric) {
    if (onMetricChange) onMetricChange(type)

    logEvent('compare', 'chart', 'metric', { metric })
  }

  function handleDateOption(option: {
    label: string
    value: [number, OpUnitType]
  }) {
    if (onDateOptionChange) onDateOptionChange(option.value)
    logEvent('compare', 'chart', 'date_range', { range: option.label })
  }

  return (
    <div
      className={cn('th-compare-chart', {
        'th-small': width && width <= BREAK_MD
      })}
    >
      <OverlaySpinner visible={loading} absolute />

      <div className='th-chart-header'>
        <Tabs value={type} onChange={handleTabChange}>
          <Tabs.Tab label='Estimate Analytics' value='Estimate' />
          <Tabs.Tab label='Market Analytics' value='Market' />
        </Tabs>
        {width > BREAK_MD && (
          <div className='th-date-options'>
            {dateOptions.map(e => (
              <Button
                key={e.label}
                className={cn('th-date-option', {
                  'th-selected': isEqual(dateOption, e.value)
                })}
                onClick={() => handleDateOption(e)}
              >
                {e.label}
              </Button>
            ))}
          </div>
        )}
      </div>

      <div className='th-chart-content'>
        <div className='th-metrics'>
          {width > BREAK_MD ? (
            metrics
              .filter(e => e.type === type)
              .map(e => (
                <Checkbox
                  key={e.metric}
                  label={e.title}
                  checked={e.metric === metric}
                  onChange={(_, checked) => {
                    if (checked) handleMetricChange(e.metric)
                  }}
                />
              ))
          ) : (
            <>
              <Select
                value={metric}
                onChange={ev =>
                  handleMetricChange(ev.target.value as TopHap.CompareMetric)
                }
              >
                {metrics
                  .filter(e => e.type === type)
                  .map(e => (
                    <Option key={e.metric} value={e.metric}>
                      {e.title}
                    </Option>
                  ))}
              </Select>
              <Select
                value={dateOption.join()}
                onChange={ev => {
                  const option = dateOptions.find(e =>
                    isEqual(e.value.join(), ev.target.value)
                  )
                  if (option) handleDateOption(option)
                }}
              >
                {dateOptions.map(e => (
                  <Option key={e.label} value={e.value.join()}>
                    {e.label}
                  </Option>
                ))}
              </Select>
            </>
          )}
        </div>
        <LineChart
          comparables={comparables}
          colors={colors}
          data={data}
          excludes={excludes}
          interval={_getInterval(dateOption)}
          metric={metric}
          showAccuracy={showAccuracy}
        />
      </div>

      <style jsx>{styles}</style>

      <ResizeDetector handleWidth onResize={setWidth} />
    </div>
  )
}

CompareChart.defaultProps = {
  type: 'estimate',
  showAccuracy: true
}
