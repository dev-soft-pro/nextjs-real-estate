import React from 'react'
import cn from 'classnames'
import commaNumber from 'comma-number'
import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'
import {
  CartesianGrid,
  ComposedChart,
  XAxis,
  YAxis,
  Tooltip,
  Label,
  Line,
  Area,
  ResponsiveContainer,
  TooltipFormatter,
  LabelFormatter,
  TooltipPayload
} from 'recharts'
import NumAbbr from 'number-abbreviate'

import OverlaySpinner from 'components/OverlaySpinner'
import Rate from 'components/Rate'
import TopHapTooltip from 'components/Tooltip'

import styles from './styles.scss?type=global'

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
          background: '#fff8',
          border: '1px solid #eee',
          padding: 16
        }}
      >
        <p>{labelFormatter(data.payload.Date)}</p>
        <p style={{ color: data.color }}>
          Max : $
          {formatter(
            data.payload.Range[1].toFixed(0),
            'Max',
            data,
            payload.length - 1
          )}
        </p>
        <p style={{ color: data.color }}>
          Estimate : $
          {formatter(
            data.payload.Estimate.toFixed(0),
            'Estimate',
            data,
            payload.length - 1
          )}
        </p>
        <p style={{ color: data.color }}>
          Min : $
          {formatter(
            data.payload.Range[0].toFixed(0),
            'Min',
            data,
            payload.length - 1
          )}
        </p>
        <p style={{ color: data.color }}>
          Accuracy : {data.payload.Accuracy.toFixed(2)}
        </p>
      </div>
    )
  } else {
    return null
  }
}

interface ValuationCardProps {
  className?: string
  estimates: any[]
  latest: TopHap.Estimates
  property: TopHap.Property
}

export default function ValuationCard({
  className,
  estimates,
  latest,
  property
}: ValuationCardProps) {
  const data = React.useMemo(() => {
    return estimates.map(e => ({
      Date: new Date(e.date).getTime(),
      Range: [
        e.estimatedMin * property.LivingSqft,
        e.estimatedMax * property.LivingSqft
      ],
      Estimate: e.estimated * property.LivingSqft,
      Accuracy: e.accuracy
    }))
  }, [estimates])

  function formatDate(value: number | string) {
    return dayjs.utc(value).format('MM/DD/YYYY')
  }

  const estimate = +latest.estimate
  const error = +latest.error
  const estimateMin = estimate - error
  const estimateMax = estimate + error
  // TODO: Remove confidence?
  const confidence = 1

  let price = Number(property.ListAmount)
  let compText = 'list price of'

  if (property.TophapStatus === 'Sold') {
    price = Number(property.TransactionAmount)
    compText = 'sold price of'
  }

  const listPriceEstimateDifference = price - estimate

  return (
    <div className={cn('th-valuation-card', className)}>
      <div className='th-card-title th-lock-disabled'>
        <TopHapTooltip tooltip="This is the current estimated market value calculated by TopHap's Automated Valuation Model (AVM). It is not an appraisal. Estimates should only be used as a reference to determine a property's value.">
          Current Property Valuation
        </TopHapTooltip>
      </div>

      <div className='d-flex flex-row justify-content-between'>
        <span className='th-estimate'>
          $ {commaNumber(Math.round(estimate))}
        </span>
        {price > 0 ? (
          <div className='text-right'>
            <p
              className='th-difference'
              style={{
                color: listPriceEstimateDifference < 0 ? '#00c853' : '#F25138'
              }}
            >
              $
              {listPriceEstimateDifference
                ? numAbbr.abbreviate(Math.abs(listPriceEstimateDifference))
                : ''}
            </p>
            <p className='th-current'>
              {listPriceEstimateDifference >= 0
                ? 'below ' + compText
                : 'above ' + compText}
              <br />${commaNumber(Math.round(price))}
            </p>
          </div>
        ) : (
          ''
        )}
      </div>

      <div className='th-card-title mt-4'>
        <TopHapTooltip tooltip='The Value Range is the high and low value estimate for this property. The more available information, the smaller the range, and the more accurate the valuation.'>
          Property Value Range
        </TopHapTooltip>
      </div>
      <div className='th-range-bar'>
        <div className='th-back-bar' />
        <div
          className='th-current-bar'
          style={{
            width: `${((estimate - estimateMin) * 100) /
              (estimateMax - estimateMin)}%`
          }}
        />
      </div>

      <div className='d-flex flex-row justify-content-between'>
        <div className='th-min-est'>
          ${commaNumber((estimateMin || 0).toFixed(0))}
        </div>
        <div className='th-max-est'>
          ${commaNumber((estimateMax || 0).toFixed(0))}
        </div>
      </div>

      <br />
      <div className='th-valuation-history'>
        <div className='th-history-info-container'>
          <div className='th-history-info'>
            <span className='th-history-info-label'>Confidence: </span>
            <span className='th-history-info-value'>
              <Rate
                value={Math.min(Math.round((confidence / 1.5) * 5), 5)}
                character='⬢'
              />
            </span>
          </div>
          {Number(property.TransactionAmount) > 0 ? (
            <div className='th-history-info'>
              <span className='th-history-info-label'>Last Sold Price: </span>
              <span className='th-history-info-value'>
                ${commaNumber(Number(property.TransactionAmount).toFixed(0))}
                &nbsp;&nbsp;
                <span className='th-close-date'>
                  ${commaNumber(Math.round(property.TransactionAmountPerSqft))}{' '}
                  / ft <sup>2</sup>
                </span>
              </span>
            </div>
          ) : (
            ''
          )}
          {property.PreviousTransactionDate ? (
            <div className='th-history-info'>
              <span className='th-history-info-label'>Last Sold Date: </span>
              <span className='th-history-info-value'>
                {dayjs(property.PreviousTransactionDate).format('MM/DD/YYYY')}
              </span>
            </div>
          ) : (
            ''
          )}
        </div>
        <div className='th-card-title mt-4'>
          <TopHapTooltip tooltip="The Valuation History shows the property's value by month over the last 5 years. The purple line is the estimated market value and the grey area is the high and low estimate at that time. The more information, the smaller the estimate range, and the more accurate the valuation.">
            Property Valuation History
          </TopHapTooltip>
        </div>
        <div className='th-history-chart-container'>
          <ResponsiveContainer width='100%' height={260}>
            <ComposedChart
              data={data}
              margin={{ top: 0, left: 0, right: 0, bottom: 0 }}
              width={3}
            >
              <defs>
                <linearGradient id='colorRange' x1='0' y1='0' x2='0' y2='1'>
                  <stop offset='0%' stopColor='#7b7b7b' stopOpacity={0.3} />
                  <stop offset='50%' stopColor='#e9e8f2' stopOpacity={0.3} />
                  <stop offset='100%' stopColor='#ffffff' stopOpacity={0.3} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray='3 3' />
              <XAxis
                axisLine={{ stroke: '#eeeeee' }}
                dataKey='Date'
                domain={[min => min, 'auto']}
                interval='preserveStart'
                scale='time'
                tick={{ fontSize: 12, color: '#858585' }}
                tickFormatter={formatDate}
                tickLine={false}
                type='number'
              >
                <Label position='insideBottom' offset={-20}>
                  Date
                </Label>
              </XAxis>
              <YAxis
                axisLine={{ stroke: '#eeeeee' }}
                dataKey='Estimate'
                domain={[min => min * 0.9, max => max * 1.1]}
                minTickGap={3}
                mirror
                orientation='right'
                padding={{ top: 0, bottom: 10 }}
                tick={{ fontSize: 12, color: '#858585' }}
                tickFormatter={value => numAbbr.abbreviate(value, 1)}
                tickLine={false}
                type='number'
              />
              <Area
                dataKey='Range'
                fillOpacity={1}
                fill='url(#colorRange)'
                stroke='#85858588'
                type='monotone'
              />
              <Line
                connectNulls
                dataKey='Estimate'
                dot={false}
                stroke='#665ff5'
                strokeWidth={3}
                type='monotone'
              />
              <Tooltip
                content={CustomTooltip}
                formatter={value => commaNumber(value)}
                labelFormatter={formatDate}
              />
            </ComposedChart>
          </ResponsiveContainer>
          <OverlaySpinner visible={!estimates.length} absolute />
        </div>
      </div>

      <style jsx>{styles}</style>
    </div>
  )
}
