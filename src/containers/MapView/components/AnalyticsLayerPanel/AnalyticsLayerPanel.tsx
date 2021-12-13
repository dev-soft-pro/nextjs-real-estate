import React from 'react'
import cn from 'classnames'
import Button from 'components/Button'
import Popover from 'components/Popover'
import Tooltip from 'components/Tooltip'
import { descriptiveData } from 'consts/data_mapping'

import { logEvent } from 'services/analytics'
import categories from './categories'

import styles from './styles.scss?type=global'

interface AnalyticsCategoryProps {
  icon: React.ReactNode
  color: string
  title: React.ReactNode
  isActive?: boolean
  children?: React.ReactNode
  onClick?: (ev: React.MouseEvent) => void
}

function AnalyticsCategory({
  children,
  color,
  icon,
  isActive,
  title,
  onClick
}: AnalyticsCategoryProps) {
  const [expanded, setExpanded] = React.useState(false)

  function show() {
    setExpanded(true)
  }

  function close() {
    setExpanded(false)
  }

  function handleButtonClick(ev: React.MouseEvent) {
    show()

    if (onClick) onClick(ev)
  }

  return (
    <div
      className={cn('th-category', { 'th-active': isActive })}
      onMouseEnter={show}
      onMouseLeave={close}
    >
      <Button
        className='th-category-button'
        style={{ borderColor: color }}
        onClick={handleButtonClick}
      >
        <div className='th-category-bar' style={{ background: color }} />
        <div className='th-button-icon'>{icon}</div>
        <div className='th-button-title'>{title}</div>
      </Button>
      <Popover className='th-content-popover' expanded={expanded}>
        <div className='th-category-content'>
          <div className='th-category-bar' style={{ background: color }} />
          <div className='th-items'>{children}</div>
        </div>
        <div className='th-triangle-down' />
      </Popover>
    </div>
  )
}

interface AnalyticsMetricProps {
  metric: TopHap.AnalyticsMetric
  isActive: boolean
  onSelect: () => void
}

function AnalyticsMetric({ metric, isActive, onSelect }: AnalyticsMetricProps) {
  return (
    <Tooltip
      tooltip={descriptiveData[metric].tooltip}
      trigger='hover'
      placement='right'
    >
      <Button
        className={cn('th-metric-button', { 'th-active': isActive })}
        onClick={onSelect}
      >
        {descriptiveData[metric].title}
      </Button>
    </Tooltip>
  )
}

interface AnalyticsLayerPanelProps {
  descriptive: TopHap.MapPreferences['descriptive']
  setMapOption: TopHap.PreferencesCreators['setMapOption']
}

export default function AnalyticsLayerPanel({
  descriptive,
  setMapOption
}: AnalyticsLayerPanelProps) {
  function onSelect(value: TopHap.AnalyticsMetric) {
    let option
    if (!descriptive.enabled) {
      option = {
        enabled: true,
        metric: value
      }
    } else {
      if (value === descriptive.metric) {
        option = {
          enabled: !descriptive.enabled,
          metric: descriptive.metric
        }
      } else {
        option = {
          enabled: descriptive.enabled,
          metric: value
        }
      }
    }

    setMapOption('descriptive', option, true)

    logEvent('map', 'analytics_layer', null, {
      metric: option.metric,
      enabled: option.enabled
    })
  }

  return (
    <div className='th-analytics-layers-panel'>
      {categories.map(category => (
        <AnalyticsCategory
          key={category.id}
          color={category.color}
          icon={<category.Icon />}
          title={category.title}
          isActive={
            descriptive.enabled && category.items.includes(descriptive.metric)
          }
        >
          {category.items.map(e => (
            <React.Fragment key={e}>
              <AnalyticsMetric
                metric={e}
                isActive={descriptive.enabled && descriptive.metric === e}
                onSelect={() => onSelect(e)}
              />
              <hr className='th-break' />
            </React.Fragment>
          ))}
        </AnalyticsCategory>
      ))}

      <style jsx>{styles}</style>
    </div>
  )
}
