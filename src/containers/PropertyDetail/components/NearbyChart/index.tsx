import React from 'react'
import NumAbbr from 'number-abbreviate'
import {
  Bar,
  CartesianGrid,
  Cell,
  ComposedChart,
  XAxis,
  YAxis,
  Tooltip,
  Label,
  Line,
  ResponsiveContainer
} from 'recharts'

import OverlaySpinner from 'components/OverlaySpinner'

const numAbbr = new NumAbbr(['K', 'M', 'G', 'T'])

interface NearbyChartProps {
  data: any[]
  selfIndex: number
  loading: boolean
  height?: number
}

export default function NearbyChart({
  data,
  selfIndex,
  loading,
  height
}: NearbyChartProps) {
  const memoizedData = React.useMemo(
    () =>
      data
        ? data.map(e => ({
            Key: e.key,
            Properties: e.doc_count,
            '$/ft²': e.recent.price_per_sqft.value
          }))
        : [],
    [data]
  )

  return (
    <div style={{ position: 'relative' }}>
      <OverlaySpinner visible={loading} absolute />

      <ResponsiveContainer height={height}>
        <ComposedChart
          data={memoizedData}
          margin={{ top: 40, right: 10, left: 10, bottom: 30 }}
        >
          <CartesianGrid vertical={false} stroke='#eeeeee' />
          <XAxis
            dataKey='Key'
            tick={{ fontSize: 14, color: '#858585' }}
            axisLine={{ stroke: '#eeeeee' }}
          />
          <YAxis
            yAxisId='left'
            dataKey='Properties'
            tick={{ fontSize: 12, color: '#858585' }}
            tickFormatter={value => numAbbr.abbreviate(value)}
            width={50}
            axisLine={false}
          >
            <Label
              angle={-90}
              position='insideLeft'
              style={{ textAnchor: 'middle' }}
            >
              # of properties
            </Label>
          </YAxis>
          <YAxis
            yAxisId='right'
            dataKey='$/ft²'
            orientation='right'
            domain={[min => min * 0.9, max => max * 1.1]}
            tick={{ fontSize: 12, color: '#858585' }}
            tickFormatter={value => numAbbr.abbreviate(Math.round(value), 0)}
            width={50}
            axisLine={false}
          >
            <Label
              angle={-90}
              position='insideRight'
              style={{ textAnchor: 'middle' }}
            >
              Price / ft²
            </Label>
          </YAxis>
          <Bar yAxisId='left' dataKey='Properties' fill='#d1d1d1'>
            {data.map((e, index) => {
              const color = index === selfIndex ? '#6651f5' : '#d1d1d1'
              return <Cell key={index} fill={color} />
            })}
          </Bar>
          <Line
            type='monotone'
            dataKey='$/ft²'
            yAxisId='right'
            stroke='#f5a623'
            strokeWidth={3}
            dot={{ strokeWidth: 2, r: 4 }}
            activeDot={{ strokeWidth: 3, r: 6 }}
            connectNulls
          />
          <Tooltip
            formatter={value =>
              numAbbr.abbreviate(Math.round(Number(value)), 0)
            }
            contentStyle={{ background: '#fffa' }}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  )
}

NearbyChart.defaultProps = {
  height: 400
}
