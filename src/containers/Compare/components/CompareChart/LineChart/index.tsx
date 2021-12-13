import { useMemo, useState } from 'react'
import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'
import {
  Area,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Label,
  Line,
  ComposedChart,
  ResponsiveContainer,
  TooltipFormatter,
  LabelFormatter,
  TooltipPayload,
  ReferenceArea,
  ReferenceLine
} from 'recharts'

import OverlaySpinner from 'components/OverlaySpinner'
import NumAbbr from 'number-abbreviate'
import styles from './styles.scss?type=global'

const numAbbr = new NumAbbr(['K', 'M', 'G', 'T'])
dayjs.extend(utc)

interface LineChartProps {
  comparables: TopHap.Comparable[]
  colors: { [key: string]: string }
  data: any[]
  excludes?: { [key: string]: boolean }
  interval: 'month' | 'week' | 'day'
  loading?: boolean
  showAccuracy?: boolean
  metric: TopHap.CompareMetric
}

export default function LineChart({
  colors,
  data,
  excludes,
  interval,
  loading,
  showAccuracy,
  metric,
  ...props
}: LineChartProps) {
  const [area, setArea] = useState<{
    left?: number
    leftValue?: any
    right?: number
    rightValue?: any
    isSelecting: boolean
  }>({
    isSelecting: false
  })
  const comparables = useMemo(() => {
    return props.comparables.filter(e => !(excludes && excludes[e.place.id]))
  }, [props.comparables, excludes])

  function CustomTooltip({
    formatter,
    label,
    labelFormatter,
    payload
  }: {
    formatter: TooltipFormatter
    label: string | number
    labelFormatter: LabelFormatter
    payload?: TooltipPayload[]
  }) {
    const areaLeftValue = area.leftValue
      ? area.leftValue.filter((e: any) => typeof e.value === 'number')
      : undefined
    const areaRightValue = area.rightValue
      ? area.rightValue.filter((e: any) => typeof e.value === 'number')
      : undefined

    if (payload && payload.length > 0) {
      return (
        <div className='th-tooltip-box'>
          <div className='th-date'>
            <span>{labelFormatter(label)}</span>
            {areaRightValue ? (
              <span className='th-date-range'>
                {labelFormatter(area.left as number)} -{' '}
                {labelFormatter(area.right as number)}
              </span>
            ) : null}
          </div>
          {payload
            .filter(e => typeof e.value === 'number')
            .map((e, index) => {
              let rangeDiff, rangePct
              if (
                areaRightValue &&
                areaRightValue[index] &&
                areaLeftValue &&
                areaLeftValue[index]
              ) {
                rangeDiff =
                  areaRightValue[index].value - areaLeftValue[index].value
                rangePct = Math.round(
                  (rangeDiff / areaLeftValue[index].value) * 100
                )
              }

              return (
                <div key={index} className='th-info'>
                  <div
                    className='th-indicator'
                    style={{ background: e.color }}
                  />
                  <div className='d-flex justify-content-between w-100'>
                    <div className='th-address'>
                      {comparables[index].place.place_type[0] === 'address'
                        ? (comparables[index].data as TopHap.Property)
                            .displayAddress
                        : comparables[index].place.place_name}
                    </div>
                    <div className='th-value'>
                      {formatter
                        ? formatter(e.value as number, e.name, e, index)
                        : e.value}

                      <span className='th-accuracy'>
                        [{e.payload[e.name].accuracy.min.toFixed(2)}%,
                        {e.payload[e.name].accuracy.max.toFixed(2)}%]
                      </span>
                    </div>
                    {rangeDiff ? (
                      <div
                        className='th-range'
                        style={{ color: rangeDiff > 0 ? 'green' : 'red' }}
                      >
                        (
                        <span>
                          {formatter
                            ? formatter(rangeDiff, e.name, e, index)
                            : rangeDiff}
                          ,
                        </span>
                        <span>{rangePct}%</span>)
                      </div>
                    ) : null}
                  </div>
                </div>
              )
            })}
          <style jsx>{styles}</style>
        </div>
      )
    } else {
      return null
    }
  }

  function onMouseDown(e: any) {
    if (!e) return
    setArea({
      left: e.activeLabel,
      leftValue:
        e && e.activePayload
          ? e.activePayload.map((e: any) => ({
              name: e.name,
              value: e.value
            }))
          : undefined,
      isSelecting: true
    })
  }

  function onMouseMove(e: any) {
    if (!e) return
    if (area.isSelecting) {
      setArea({
        ...area,
        right: e.activeLabel,
        rightValue: e.activePayload
          ? e.activePayload.map((e: any) => ({
              name: e.name,
              value: e.value
            }))
          : undefined
      })
    }
  }

  function formatDate(value: string | number) {
    return dayjs
      .utc(value)
      .format(interval === 'month' ? 'MMM YYYY' : 'DD MMM YYYY')
  }

  function formatValue(value: string | number | Array<string | number>) {
    if (metric === '% Change') {
      return `${(value as number).toFixed(1)}%`
    } else if (metric === 'Turnover') {
      return `${(value as number).toFixed(3)}%`
    } else {
      return numAbbr.abbreviate(Math.round(value as number), 1)
    }
  }

  const now = dayjs().valueOf()

  return (
    <div className='th-compare-linechart'>
      <OverlaySpinner visible={loading} absolute />

      <ResponsiveContainer width='100%' height={300}>
        <ComposedChart
          data={data}
          margin={{ top: 0, right: 0, left: 40, bottom: 20 }}
          onMouseDown={onMouseDown}
          onMouseMove={onMouseMove}
          onMouseUp={() => setArea({ isSelecting: false })}
        >
          <XAxis
            dataKey='date'
            scale='time'
            type='number'
            domain={['auto', 'auto']}
            tickFormatter={formatDate}
            tick={{ fontSize: 12, color: '#858585' }}
            axisLine={{ stroke: '#eeeeee' }}
            tickMargin={5}
          >
            <Label
              position='insideBottom'
              offset={-12}
              style={{ fontSize: 12, color: '#595959' }}
            >
              Estimate Date
            </Label>
          </XAxis>
          <YAxis
            tickFormatter={value => numAbbr.abbreviate(value, 1)}
            domain={['auto', 'auto']}
            tick={{ fontSize: 12, color: '#858585' }}
            axisLine={false}
            tickMargin={5}
            width={30}
          >
            <Label
              angle={-90}
              position='insideLeft'
              style={{ textAnchor: 'middle', fontSize: 12, color: '#595959' }}
              offset={-36}
            >
              {metric}
            </Label>
          </YAxis>
          <CartesianGrid vertical={false} stroke='#eeeeee' />

          <ReferenceLine x={now} stroke='#595959' strokeDasharray='3 3' />
          {area.left && area.right ? (
            <ReferenceArea x1={area.left} x2={area.right} />
          ) : null}

          {comparables.map(comparable => [
            showAccuracy ? (
              <Area
                key={`area-${comparable.place.id}`}
                connectNulls
                dataKey={data =>
                  data[comparable.place.id]
                    ? data[comparable.place.id].range
                    : null
                }
                fill={colors[comparable.place.id]}
                fillOpacity={0.2}
                name={comparable.place.id}
                stroke={colors[comparable.place.id]}
                strokeOpacity={0.3}
                type='monotone'
                animationDuration={500}
              />
            ) : null,
            <Line
              key={`line-${comparable.place.id}`}
              connectNulls
              dataKey={data =>
                data[comparable.place.id]
                  ? data[comparable.place.id].value
                  : null
              }
              dot={false}
              name={comparable.place.id}
              stroke={colors[comparable.place.id]}
              strokeWidth={2}
              type='monotone'
              animationDuration={500}
            />
          ])}

          <Tooltip
            formatter={formatValue}
            labelFormatter={formatDate}
            content={CustomTooltip}
          />
        </ComposedChart>
      </ResponsiveContainer>
      <style jsx>{styles}</style>
    </div>
  )
}
