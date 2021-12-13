import React, { useMemo } from 'react'
import {
  CartesianGrid,
  ComposedChart,
  XAxis,
  YAxis,
  Tooltip,
  Label,
  Line,
  ResponsiveContainer
} from 'recharts'
import NumAbbr from 'number-abbreviate'
import cn from 'classnames'
import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'

import Button from 'components/Button'
import OverlaySpinner from 'components/OverlaySpinner'
import styles from './styles.scss?type=global'

const numAbbr = new NumAbbr(['K', 'M', 'G', 'T'])
dayjs.extend(utc)

const dateOptions = [
  {
    label: '1W',
    from: 'now-1w/d',
    interval: 'day'
  },
  {
    label: '1M',
    from: 'now-1M/d',
    interval: 'day'
  },
  {
    label: '3M',
    from: 'now-3M/d',
    interval: 'week'
  },
  {
    label: '6M',
    from: 'now-6M/d'
  },
  {
    label: '1Y',
    from: 'now-1y/d'
  },
  {
    label: '2Y',
    from: 'now-2y/d'
  },
  {
    label: '5Y',
    from: 'now-5y/d'
  }
]

interface DomPriceChartProps {
  data: TopHap.PropertiesState['neighborhoodDom']['items']
  loading: boolean
  height?: number
  dateOption: any
  onChangeDateOption(dateOption: any): void
}

export default function DomPriceChart({
  data,
  loading,
  height,
  dateOption,
  onChangeDateOption
}: DomPriceChartProps) {
  const memoizedData = useMemo(
    () =>
      data
        ? data.map(e => ({
            Date: e.key,
            Price: e.avg_list_price.values['50.0'],
            DOM: e.avg_dom.values['50.0']
          }))
        : [],
    [data]
  )

  const now = new Date().getTime()

  function formatDate(value: string | number) {
    return dayjs.utc(value).format('MMM YYYY')
  }

  function DatePicker(dateOption: any) {
    return (
      <div className='th-date-picker'>
        {dateOptions.map(e => (
          <Button
            key={e.from}
            className={cn('th-date-option', {
              'th-selected': dateOption.value.from === e.from
            })}
            onClick={() => onChangeDateOption(e)}
          >
            {e.label}
          </Button>
        ))}
      </div>
    )
  }

  return (
    <div className='th-date-price-chart'>
      <DatePicker value={dateOption} />
      <OverlaySpinner visible={loading} absolute />

      <ResponsiveContainer height={height || 400}>
        <ComposedChart
          data={memoizedData}
          margin={{ top: 10, right: 10, left: 10, bottom: 30 }}
        >
          <CartesianGrid vertical={false} stroke='#eeeeee' />
          <XAxis
            dataKey='Date'
            scale='time'
            type='number'
            domain={['auto', now]}
            tickFormatter={formatDate}
            tick={{ fontSize: 12, color: '#858585' }}
            axisLine={{ stroke: '#eeeeee' }}
            tickMargin={5}
          />
          <YAxis
            yAxisId='left'
            dataKey='DOM'
            domain={[min => min * 0.5, max => max * 1.1]}
            tick={{ fontSize: 12 }}
            tickFormatter={value => numAbbr.abbreviate(Math.round(value))}
            width={50}
            axisLine={{ stroke: '#f5a623' }}
          >
            <Label
              angle={-90}
              position='insideLeft'
              style={{ textAnchor: 'middle', fill: '#f5a623' }}
            >
              DOM
            </Label>
          </YAxis>
          <YAxis
            yAxisId='right'
            dataKey='Price'
            orientation='right'
            domain={[min => min * 0.5, max => max * 1.1]}
            tick={{ fontSize: 12 }}
            tickFormatter={value => numAbbr.abbreviate(Math.round(value), 0)}
            width={50}
            axisLine={{ stroke: '#6651f5' }}
          >
            <Label
              angle={-90}
              position='insideRight'
              style={{ textAnchor: 'middle', fill: '#6651f5' }}
            >
              Price
            </Label>
          </YAxis>
          <Line
            type='monotone'
            dataKey='DOM'
            yAxisId='left'
            stroke='#f5a623'
            strokeWidth={3}
            dot={false}
            activeDot={{ strokeWidth: 3, r: 6 }}
            connectNulls
          />
          <Line
            type='monotone'
            dataKey='Price'
            yAxisId='right'
            stroke='#6651f5'
            strokeWidth={3}
            dot={false}
            activeDot={{ strokeWidth: 3, r: 6 }}
            connectNulls
          />
          <Tooltip
            formatter={value =>
              numAbbr.abbreviate(Math.round(Number(value)), 0)
            }
            labelFormatter={formatDate}
            contentStyle={{ background: '#fffa' }}
          />
        </ComposedChart>
      </ResponsiveContainer>
      <style jsx>{styles}</style>
    </div>
  )
}
