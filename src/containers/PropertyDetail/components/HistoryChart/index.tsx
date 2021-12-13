import React from 'react'
import {
  CartesianGrid,
  ComposedChart,
  XAxis,
  YAxis,
  Tooltip,
  // Label,
  Line,
  // ReferenceLine,
  ResponsiveContainer,
  TooltipFormatter,
  LabelFormatter,
  TooltipPayload
} from 'recharts'
import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'
import NumAbbr from 'number-abbreviate'
import { propertyStatus } from 'consts/data_mapping'

import OverlaySpinner from 'components/OverlaySpinner'

const numAbbr = new NumAbbr(['K', 'M', 'G', 'T'])
dayjs.extend(utc)

const CustomTooltip = ({
  formatter,
  labelFormatter,
  payload
}: {
  formatter: TooltipFormatter
  labelFormatter: LabelFormatter
  payload?: TooltipPayload[]
}) => {
  if (payload && payload.length > 0) {
    const data = payload[payload.length - 1]
    return (
      <div
        style={{
          background: 'white',
          border: '1px solid #eee',
          padding: 16
        }}
      >
        <p>{labelFormatter(data.payload.Date)}</p>
        {data.payload.Date !== undefined && (
          <p style={{ color: data.color }}>
            Estimate Price :&nbsp;
            {formatter(data.payload.Date, 'Date', data, payload.length - 1)}
          </p>
        )}
      </div>
    )
  } else {
    return null
  }
}

interface HistoryChartProps {
  estimates: {
    key: number
    price: number
  }[]
  history: TopHap.PropertyHistory[]
  loading?: boolean
}

type History = {
  Date: number
  Estimate: number
  event?: TopHap.PropertyHistory
}

const CustomDot = ({ cx, cy, payload }: any) => {
  if (payload.event) {
    const event: TopHap.PropertyHistory = payload.event
    if (event._source.Facts.TransactionType === 'Listing') {
      const status: TopHap.PropertyStatus = event._source.Facts.TophapStatus
      const width = 52
      const height = 27
      return (
        <svg
          x={cx - width / 2}
          y={cy - height - 5}
          xmlns='http://www.w3.org/2000/svg'
          width={width}
          height={height}
          viewBox={`0 0 ${width} ${height}`}
        >
          <path
            fill={propertyStatus[status].color}
            fillRule='evenodd'
            stroke='#FFF'
            strokeWidth='2'
            d='M41 1H11C8.239 1 5.739 2.12 3.929 3.929 2.119 5.739 1 8.239 1 11s1.12 5.261 2.929 7.071C5.739 19.881 8.239 21 11 21h10.342L26 25.657 30.657 21H41c2.761 0 5.261-1.12 7.071-2.929C49.881 16.261 51 13.761 51 11s-1.12-5.261-2.929-7.071C46.261 2.119 43.761 1 41 1z'
          />
          <text
            x={width / 2}
            y={15}
            fontSize='10'
            fontWeight='bold'
            textAnchor='middle'
            fill='white'
          >
            {status}
          </text>
        </svg>
      )
    } else {
      // TODO: Need to render proper Markers per TransactionType
      const width = 10
      const height = 27
      return (
        <svg
          x={cx - width / 2}
          y={230}
          xmlns='http://www.w3.org/2000/svg'
          width={width}
          height={height}
          viewBox={`0 0 ${width} ${height}`}
        >
          <text
            x={width / 2}
            y={height / 2}
            fontSize='12'
            fontWeight='bold'
            textAnchor='middle'
            fill='#d43f51'
          >
            {event._source.Facts.TransactionType[0]}
          </text>
        </svg>
      )
    }
  }

  return null
}

export default function HistoryChart({
  estimates,
  history,
  loading
}: HistoryChartProps) {
  const data = React.useMemo(() => {
    const data: History[] = estimates
      .map(e => ({
        Date: e.key,
        Estimate: e.price
      }))
      .sort((a, b) => a.Date - b.Date)

    history.forEach(e => {
      let date: any
      const type = e._source.Facts.TransactionType

      if (type === 'Tax') {
        date = e._source.Facts.TaxDate
      } else if (type === 'Listing') {
        date = e._source.Facts.ListDate
      } else {
        date = e._source.Facts.TransactionDate
      }

      date = dayjs(date)
        .utc()
        .valueOf()

      // assume history is sorted by date in asc order
      const item = data.find(e => date < e.Date)
      if (item) {
        item.event = e
      }
    })
    return data
  }, [history, estimates])

  const now = new Date().getTime()

  function formatDate(value: string | number) {
    return dayjs.utc(value).format('MM/DD/YYYY')
  }

  function formatValue(value: string | number | Array<string | number>) {
    return '$' + numAbbr.abbreviate(value, 1)
  }

  return (
    <div style={{ position: 'relative' }}>
      <OverlaySpinner visible={loading} absolute />

      <ResponsiveContainer width='100%' height={300}>
        <ComposedChart
          data={data}
          margin={{ top: 20, right: 0, left: 0, bottom: 20 }}
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
            tickFormatter={formatValue}
            domain={[min => min * 0.9, max => max * 1.1]}
            tick={{ fontSize: 12, color: '#858585' }}
            axisLine={false}
            tickMargin={5}
          />
          <Line
            type='monotone'
            dataKey='Estimate'
            stroke='#6651f5'
            strokeWidth={3}
            dot={<CustomDot />}
            activeDot={{ strokeWidth: 3, r: 6 }}
            connectNulls
          />
          <Tooltip
            formatter={formatValue}
            labelFormatter={formatDate}
            content={CustomTooltip}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  )
}
