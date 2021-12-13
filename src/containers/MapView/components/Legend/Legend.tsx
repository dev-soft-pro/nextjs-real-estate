import React from 'react'
import { ReactReduxContext } from 'react-redux'
import LegendIcon from '@material-ui/icons/LineStyle'
import CloseIcon from '@material-ui/icons/Close'
import cn from 'classnames'

import imgPinNew from 'assets/images/pin/new.png'
import imgPinActive from 'assets/images/pin/active.png'
import imgPinSold from 'assets/images/pin/sold.png'
import imgPinPending from 'assets/images/pin/pending.png'
import SvgMore from 'assets/images/icons/more_vert.svg'

import { logEvent } from 'services/analytics'

import AuthLock from 'components/AuthLock'
import Button from 'components/Button'
import Checkbox from 'components/Checkbox'
import Tooltip from 'components/Tooltip'
import Popover from 'components/Popover'
import LegendOptionsPanel from '../LegendOptionsPanel'
import PermitsLayerPanel from '../PermitsLayerPanel'
import ProfitLayerPanel from '../ProfitLayerPanel'
import EstimateChangeLayerPanel from '../EstimateChangeLayerPanel'
import EstimateSoldRatioOptions from '../EstimateSoldRatioLayerOptions'
import SchoolLayerOptions from '../SchoolLayerOptions'
import TaxLayerOptions from '../TaxLayerOptions'
import TemperatureLayerOptions from '../TemperatureLayerOptions'
import UniqueZonesLayerPanel from '../UniqueZonesLayerPanel'

import { MAP_SWITCHING_ZOOM_LEVEL } from 'consts'
import {
  descriptiveData,
  propertyData,
  formatAnalyticsMetric
} from 'consts/data_mapping'

import styles from './styles.scss?type=global'
import { isPropertyMode } from 'utils/map'

interface LegendProps {
  isMobile: TopHap.GlobalState['isMobile']
  descriptive: TopHap.MapPreferences['descriptive']
  elevations: TopHap.MapPreferences['elevations']
  expanded: TopHap.UIState['isLegendExpanded']
  permitOptions: TopHap.MapPreferences['permitOptions']
  permitsTypes: TopHap.PropertiesState['permits']['types']
  profitOptions: TopHap.MapPreferences['profitOptions']
  propertiesOptions: TopHap.MapPreferences['properties']
  properties: {
    aggregationsCounts: TopHap.PropertiesState['aggregations']['counts']
    items: TopHap.PropertiesState['map']['items']
    descriptive: TopHap.PropertiesState['descriptive']
    descriptiveParcels: TopHap.PropertiesState['descriptiveParcels']
  }
  zoom: number
  setExpanded: (expanded: boolean) => void
  setMapOption: TopHap.PreferencesCreators['setMapOption']
}

export default function Legend({
  descriptive,
  elevations,
  expanded,
  isMobile,
  permitOptions,
  permitsTypes,
  profitOptions,
  propertiesOptions,
  properties,
  zoom,
  setExpanded,
  setMapOption
}: LegendProps) {
  const propertiesCounts = React.useMemo(() => {
    const counts = {
      Pending: 0,
      Sold: 0,
      New: 0,
      Active: 0,
      Inactive: 0
    }

    properties.items.forEach(e => {
      counts[e.TophapStatus]++
    })
    return counts
  }, [properties.items])
  const context = React.useContext(ReactReduxContext)
  const [optionPanel, showOptionPanel] = React.useState(false)

  function toggleExpansion() {
    setExpanded(!expanded)

    logEvent('map', 'legend', 'trigger', { expanded: !expanded })
  }

  function toggleOptionPanel() {
    showOptionPanel(!optionPanel)

    logEvent('map', 'legend', 'option_panel', { expanded: !optionPanel })
  }

  function onClickOutsideOfOptions(ev: MouseEvent | TouchEvent) {
    const appElement: Element = document.querySelector('.th-app') as Element
    if (!appElement.contains(ev.target as Node)) return

    showOptionPanel(false)
  }

  function _renderOptionsPanel() {
    return (
      <Popover
        className={cn('th-option-panel')}
        expanded={optionPanel}
        onClickOutside={onClickOutsideOfOptions}
      >
        <div className='th-panel-body'>
          <AuthLock event='LegendOptionsPanel' />
          <LegendOptionsPanel />
        </div>
      </Popover>
    )
  }

  function _renderTimePeriod() {
    const { enabled, metric, closeDate, hasCloseDate } = descriptive

    if (!enabled) return null
    if (
      metric !== 'dom' &&
      metric !== 'list_vs_sold' &&
      metric !== 'estimate_sold_ratio' &&
      metric !== 'turnover'
    ) {
      return null
    }

    return (
      <section className='th-section th-period-section'>
        <div className='th-section-title'>
          <Checkbox
            className='th-time-period-checkbox'
            label='Time Period'
            checked={hasCloseDate}
            onChange={event =>
              setMapOption('descriptive.hasCloseDate', event.target.checked)
            }
          />
        </div>
        <div className='th-section-body'>
          <div className='th-pre-selected-dates'>
            <Button
              className={cn({ 'th-selected': closeDate.min === 'now-1M/d' })}
              disabled={!hasCloseDate}
              onClick={() =>
                setMapOption('descriptive.closeDate.min', 'now-1M/d')
              }
            >
              1M
            </Button>
            <Button
              className={cn({ 'th-selected': closeDate.min === 'now-6M/d' })}
              disabled={!hasCloseDate}
              onClick={() =>
                setMapOption('descriptive.closeDate.min', 'now-6M/d')
              }
            >
              6M
            </Button>
            <Button
              className={cn({ 'th-selected': closeDate.min === 'now-1y/d' })}
              disabled={!hasCloseDate}
              onClick={() =>
                setMapOption('descriptive.closeDate.min', 'now-1y/d')
              }
            >
              1Y
            </Button>
          </div>
          <div />
        </div>
      </section>
    )
  }

  function _renderAnalyticsOptions() {
    if (!descriptive.enabled) return null

    let ui: React.ReactNode
    const { metric } = descriptive
    if (metric === 'permits_value' || metric === 'permits_count') {
      ui = (
        <PermitsLayerPanel
          types={permitsTypes}
          descriptive={descriptive}
          permitOptions={permitOptions}
          setMapOption={setMapOption}
        />
      )
    } else if (metric === 'profit') {
      ui = (
        <ProfitLayerPanel
          enabled={descriptive.metric === 'profit'}
          profitOptions={profitOptions}
          setMapOption={setMapOption}
        />
      )
    } else if (metric === 'estimate_change') {
      ui = <EstimateChangeLayerPanel setMapOption={setMapOption} />
    } else if (metric === 'estimate_sold_ratio') {
      ui = <EstimateSoldRatioOptions setMapOption={setMapOption} />
    } else if (metric.startsWith('school_')) {
      if (
        metric !== 'school_college_bound' &&
        metric !== 'school_test_score_rating'
      ) {
        ui = <SchoolLayerOptions setMapOption={setMapOption} />
      }
    } else if (metric === 'tax') {
      ui = <TaxLayerOptions setMapOption={setMapOption} />
    } else if (metric === 'temperature') {
      ui = <TemperatureLayerOptions setMapOption={setMapOption} />
    } else if (metric === 'unique_zones') {
      ui = <UniqueZonesLayerPanel setMapOption={setMapOption} />
    }

    if (ui) {
      return <div className='mt-2'>{ui}</div>
    } else {
      return null
    }
  }

  const {
    enabled,
    labelEnabled,
    colorEnabled,
    radiusEnabled,
    color,
    radius
  } = propertiesOptions

  const hasRow = (enabled && (colorEnabled || radiusEnabled)) || descriptive
  if (!hasRow) return null

  // CONSIDER: should match to MapModel.
  const propertiesColors = ['#0f0', '#0ff', '#00f', '#f0f', '#f00']

  const colors = [
    'rgb(244, 229, 135)',
    'rgb(175, 240, 91)',
    'rgb(96, 247, 97)',
    'rgb(41, 234, 141)',
    'rgb(26, 199, 194)',
    'rgb(48, 150, 224)',
    'rgb(84, 101, 214)'
  ]

  const _isPropertyMode = isPropertyMode(context.store.getState())
  const counts = _isPropertyMode
    ? propertiesCounts
    : properties.aggregationsCounts

  return (
    <>
      <div
        className={cn(
          'th-map-legend',
          { 'th-expanded': expanded },
          { 'th-mobile': isMobile.phone }
        )}
      >
        <section className='th-section th-header-section'>
          <Button className='th-close-button' onClick={toggleExpansion}>
            <CloseIcon />
          </Button>
          <div className='th-section-title'>Map Legend</div>
          <Button className='th-option-button' onClick={toggleOptionPanel}>
            <SvgMore />
          </Button>
          {_renderOptionsPanel()}
        </section>
        {enabled && labelEnabled && (
          <section className='th-section'>
            <div className='th-section-title'>Properties Status</div>
            <div className='th-section-body'>
              <div className='th-callout'>
                <div className='th-callout-icon'>
                  <img src={imgPinNew} alt='New' />
                  <span>New</span>
                </div>
                <span>{counts.New || 0}</span>
              </div>
              <div className='th-callout'>
                <div className='th-callout-icon'>
                  <img src={imgPinActive} alt='New' />
                  <span>Active</span>
                </div>
                <span>{counts.Active || 0}</span>
              </div>
              <div className='th-callout'>
                <div className='th-callout-icon'>
                  <img src={imgPinPending} alt='New' />
                  <span>Pending</span>
                </div>
                <span>{counts.Pending || 0}</span>
              </div>
              <div className='th-callout'>
                <div className='th-callout-icon'>
                  <img src={imgPinSold} alt='New' />
                  <span>Sold</span>
                </div>
                <span>{counts.Sold || 0}</span>
              </div>
            </div>
          </section>
        )}

        {enabled && colorEnabled && (
          <section className='th-section'>
            <div className='th-section-title'>{propertyData[color].title}</div>
            <div className='th-section-body'>
              <div className='th-value'>Low</div>
              <div className='th-colors'>
                {propertiesColors.map(e => (
                  <div key={e} style={{ background: e }} />
                ))}
              </div>
              <div className='th-value'>High</div>
            </div>
          </section>
        )}

        {enabled && radiusEnabled && (
          <section className='th-section'>
            <div className='th-section-title'>{propertyData[radius].title}</div>
            <div className='th-section-body'>
              <div className='th-value'>Low</div>
              <div className='th-circles'>
                {[6, 12, 15, 18, 21, 28].map(e => (
                  <div key={e} style={{ width: e, height: e }} />
                ))}
              </div>
              <div className='th-value'>High</div>
            </div>
          </section>
        )}

        {!elevations && descriptive.enabled && (
          <section className='th-section th-analytics-section'>
            <Tooltip
              tooltip={
                isMobile.any
                  ? undefined
                  : descriptiveData[descriptive.metric].tooltip
              }
              placement='right'
              trigger='hover'
            >
              <div className='th-section-title'>
                {descriptiveData[descriptive.metric].title}
                <div className='th-descriptive-info-button'>ⓘ</div>
              </div>
            </Tooltip>
            {descriptive.metric !== 'property_use' &&
              descriptive.metric !== 'unique_zones' && (
                <>
                  <div className='th-section-body'>
                    <div className='th-value'>
                      {formatAnalyticsMetric(
                        descriptive.metric,
                        zoom >= MAP_SWITCHING_ZOOM_LEVEL
                          ? properties.descriptiveParcels.min
                          : properties.descriptive.min,
                        zoom >= MAP_SWITCHING_ZOOM_LEVEL
                          ? 'parcel'
                          : 'aggregation'
                      )}
                    </div>
                    <div className='th-hexagons'>
                      {colors.map(e => (
                        <div key={e} style={{ background: e, color: e }} />
                      ))}
                    </div>
                    <div className='th-value'>
                      {formatAnalyticsMetric(
                        descriptive.metric,
                        zoom >= MAP_SWITCHING_ZOOM_LEVEL
                          ? properties.descriptiveParcels.max
                          : properties.descriptive.max,
                        zoom >= MAP_SWITCHING_ZOOM_LEVEL
                          ? 'parcel'
                          : 'aggregation'
                      )}
                    </div>
                  </div>
                </>
              )}
            {_renderAnalyticsOptions()}
          </section>
        )}

        {_renderTimePeriod()}
      </div>
      <Button className='th-map-legend-trigger' onClick={toggleExpansion}>
        <LegendIcon />
      </Button>

      <style jsx>{styles}</style>
    </>
  )
}
