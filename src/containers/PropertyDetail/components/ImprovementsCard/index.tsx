import React from 'react'
import Slider from '@material-ui/core/Slider'
import cn from 'classnames'
import commaNumber from 'comma-number'
import IconButton from '@material-ui/core/IconButton'
import MinusIcon from '@material-ui/icons/RemoveCircleOutline'
import PlusIcon from '@material-ui/icons/ControlPoint'

import OverlaySpinner from 'components/OverlaySpinner'
import Rate from 'components/Rate'
import TopHapTooltip from 'components/Tooltip'

import { logEvent } from 'services/analytics'

import styles from './styles.scss?type=global'

function InfoItem({
  title,
  value,
  onSmaller,
  onBigger
}: {
  title: string
  value: number
  onSmaller(): void
  onBigger(): void
}) {
  return (
    <div className='th-info'>
      <div className='th-info-title'>{title}</div>
      <div className='th-info-value'>
        <IconButton className='th-minus-button' onClick={onSmaller}>
          <MinusIcon />
        </IconButton>
        <input value={value || ''} disabled />
        <IconButton className='th-plus-button' onClick={onBigger}>
          <PlusIcon />
        </IconButton>
      </div>
    </div>
  )
}

interface ImprovementsProps {
  className?: string
  target: any
  estimate: any
  valuation: TopHap.Estimates
  improvementCondition: number
  onChangeTarget(target: any, improvementCondition: number): void
}

export default function ImprovementsCard({
  className,
  target,
  estimate,
  valuation,
  improvementCondition,
  onChangeTarget
}: ImprovementsProps) {
  function onChange(field: string, value: number) {
    onChangeTarget(
      {
        ...target,
        [field]: Math.max(target[field] + value, 0)
      },
      improvementCondition
    )

    // analytics
    logEvent(
      'listing_detail',
      'listing_detail_calculator_change',
      JSON.stringify({
        key: field,
        origin: estimate.targetHouse ? estimate.targetHouse[field] : undefined,
        value
      })
    )
  }

  function onChangeImprovementCondition(
    ev: React.ChangeEvent<{}>,
    value: number | number[]
  ) {
    onChangeTarget(target, value as number)
  }

  const accuracy = estimate.accuracy
  const valuationEstimate = Number(valuation.estimate)

  const estimated = estimate.targetHouse
    ? estimate.estimated * estimate.targetHouse.LivingArea
    : 0
  const improvement = estimate.targetHouse
    ? Math.max(estimated - valuationEstimate, 0)
    : 0

  const _rangeMax = (valuationEstimate - valuationEstimate / 100) * 2

  return (
    <div className={cn('th-improvements-card', className)}>
      <div className='th-card-title th-lock-disabled'>
        <TopHapTooltip tooltip="Projected Value Calculator is a what-if calculator that allows you to see the estimated property value with different property characteristics. This calculator is usefull if you are planning an addition to increase square footage, complete rebuild or a remodel that improves the property condition. As you change the calculator's parameters note the Comparables map that changes to reflect the new property Comparables based on the proposed adjustments.">
          Projected Value Calculator
        </TopHapTooltip>
      </div>

      <div className='th-estimate-value'>
        ${commaNumber(Math.max(estimated, valuationEstimate).toFixed(0))}
        <div className='th-history-info'>
          <span className='th-history-info-label'>Confidence:&nbsp;</span>
          <span className='th-history-info-value'>
            <Rate
              value={Math.min(Math.round((accuracy / 1.5) * 5), 5)}
              character='⬢'
            />
          </span>
        </div>
      </div>
      <div className='th-range-bar'>
        <div
          className='th-valuation-bar'
          style={{ width: `${(valuationEstimate / _rangeMax) * 100}%` }}
        />
        <div
          className='th-improvement-bar'
          style={{
            width: `${(Math.abs(improvement) / _rangeMax) * 100}%`,
            transform: improvement < 0 ? 'rotateY(-180deg)' : undefined
          }}
        />
      </div>

      <div className='d-flex mt-4'>
        <div className='th-valuation'>
          <p className='th-value'>${commaNumber(valuationEstimate)}</p>
          <p className='th-label'>TopHap Valuation</p>
        </div>
        <div className='th-improvement'>
          <p className='th-value'>
            {improvement >= 0 ? '+ ' : '- '}$
            {commaNumber(Math.abs(Math.round(improvement)))}
          </p>
          <p className='th-label'>Estimated Value of Improvements</p>
        </div>
      </div>

      <div className='th-metrics'>
        <InfoItem
          title='Living Area (sf)'
          value={target.LivingArea}
          onSmaller={() => onChange('LivingArea', -100)}
          onBigger={() => onChange('LivingArea', 100)}
        />
        <InfoItem
          title='Bedrooms'
          value={target.BedroomsTotal}
          onSmaller={() => onChange('BedroomsTotal', -1)}
          onBigger={() => onChange('BedroomsTotal', 1)}
        />
        <InfoItem
          title='Bathrooms'
          value={target.BathroomsFull}
          onSmaller={() => onChange('BathroomsFull', -0.5)}
          onBigger={() => onChange('BathroomsFull', 0.5)}
        />
        <div className='th-card-title'>
          <TopHapTooltip tooltip='The relative condition of this property compared to its surrounding neighbors.'>
            Condition
          </TopHapTooltip>
        </div>
        <Slider
          value={improvementCondition}
          valueLabelDisplay='off'
          step={10}
          marks={[
            {
              value: 0,
              label: (
                <span style={{ position: 'absolute', left: 0 }}>Inferior</span>
              )
            },
            { value: 50, label: 'Equal' },
            {
              value: 100,
              label: (
                <span style={{ position: 'absolute', right: 0 }}>Superior</span>
              )
            }
          ]}
          onChange={onChangeImprovementCondition}
          classes={{
            root: 'th-slider',
            rail: 'th-slider-rail',
            track: 'th-slider-track',
            thumb: 'th-slider-thumb',
            valueLabel: 'th-slider-value-label',
            mark: 'th-slider-mark',
            markActive: 'th-slider-mark-active',
            markLabel: 'th-slider-mark-label',
            markLabelActive: 'th-slider-mark-label-active'
          }}
        />
      </div>
      <OverlaySpinner visible={estimate.estimated === undefined} absolute />

      <style jsx>{styles}</style>
    </div>
  )
}
