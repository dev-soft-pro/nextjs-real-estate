import React, { useEffect, useMemo, useState } from 'react'
import cn from 'classnames'
import dayjs from 'dayjs'
import { Stage, Layer, Rect, Text } from 'react-konva'
import ResizeDetector from 'react-resize-detector'

import Tooltip from 'components/Tooltip'
import RangeDatePicker from './RangeDatePicker'

import SvgClose from 'assets/images/icons/close.svg'
import styles from './styles.scss'
import { Vector2d } from 'konva/types/types'
import { logEvent } from 'services/analytics'

const WIDGET_HEIGHT = 50
const WIDGET_RANGE_PADDING = 6
const WIDGET_PADDING_TOP = 12

const WIDGET_BAR_WIDTH = 9
const WIDGET_LEFT_POS = 336
const WIDGET_RIGHT_POS = 60

interface TimelineProps {
  enabled: boolean
  descriptive: TopHap.MapPreferences['descriptive']
  setFilterOption: TopHap.PreferencesCreators['setFilterOption']
  setMapOption: TopHap.PreferencesCreators['setMapOption']
}

export default function Timeline({
  enabled,
  descriptive,
  setFilterOption,
  setMapOption
}: TimelineProps) {
  const DAY_COUNT = {
    WEEK: dayjs().diff(dayjs().subtract(1, 'week'), 'day'),
    MONTH: dayjs().diff(dayjs().subtract(1, 'month'), 'day'),
    MONTH3: dayjs().diff(dayjs().subtract(3, 'month'), 'day'),
    MONTH6: dayjs().diff(dayjs().subtract(6, 'month'), 'day'),
    YEAR: dayjs().diff(dayjs().subtract(1, 'year'), 'day'),
    YEAR2: dayjs().diff(dayjs().subtract(2, 'year'), 'day'),
    YEAR5: dayjs().diff(dayjs().subtract(5, 'year'), 'day')
  }

  const [cWidth, setCWidth] = useState(450)
  const [barCount, setBarCount] = useState(60)
  const [rangeMax, setRangeMax] = useState(DAY_COUNT.MONTH3)
  const [startPos, setStartPos] = useState(-1)
  const [range, setRange] = useState(0)
  const [isMouseDown, setMouseDown] = useState(false)
  const [startDateShow, setStartDateShow] = useState(false)
  const [endDateShow, setEndDateShow] = useState(false)

  const data = useMemo(() => generateRandomData(barCount), [barCount])
  const barWidth = useMemo(() => cWidth / barCount, [barCount])
  const startDate = useMemo(
    () =>
      dayjs()
        .subtract(((cWidth - startPos) / cWidth) * rangeMax, 'day')
        .format('MM/DD/YY'),
    [startPos, cWidth]
  )
  const endDate = useMemo(
    () =>
      dayjs()
        .subtract(((cWidth - startPos - range) / cWidth) * rangeMax, 'day')
        .format('MM/DD/YY'),
    [startPos, cWidth, range]
  )

  useEffect(() => {
    if (enabled) {
      const handler = setTimeout(() => {
        setFilterOption('period', {
          min: dayjs()
            .subtract(((cWidth - startPos) / cWidth) * rangeMax, 'day')
            .format('YYYY-MM-DD'),
          max: dayjs()
            .subtract(((cWidth - startPos - range) / cWidth) * rangeMax, 'day')
            .format('YYYY-MM-DD')
        })
      }, 300)

      return () => {
        clearTimeout(handler)
      }
    }
  }, [startPos, barWidth, range, rangeMax, enabled])

  useEffect(() => {
    const newBarCount = Math.floor(
      Math.min(rangeMax, cWidth / WIDGET_BAR_WIDTH)
    )

    const diffStartDays = rangeMax - dayjs().diff(dayjs(startDate), 'day')
    const newStartPos =
      (newBarCount / rangeMax) * diffStartDays * (cWidth / newBarCount)

    const diffEndDays = rangeMax - dayjs().diff(dayjs(endDate), 'day')
    const newEndPos =
      (newBarCount / rangeMax) * diffEndDays * (cWidth / newBarCount)

    if (diffStartDays > rangeMax || diffEndDays > rangeMax) {
      setRange(0)
    } else {
      setStartPos(newStartPos)
      setRange(newEndPos - newStartPos)
    }
    setBarCount(newBarCount)
  }, [rangeMax, cWidth])

  if (!enabled) return null

  function onWidthChanged(width: number) {
    setCWidth(width - WIDGET_LEFT_POS - WIDGET_RIGHT_POS - 50)
  }

  function setOption(option: string, value: any, update?: boolean) {
    setMapOption(option, value, update)

    logEvent('map', 'legend', 'option_change', { option, value, update })
  }

  function generateRandomData(cnt: number) {
    const result = {
      minValue: 20,
      maxValue: 100,
      data: [] as number[]
    }

    Array(cnt)
      .fill('')
      .forEach(() => {
        result.data.push(Math.random() * 80 + result.minValue)
      })

    return result
  }

  function startRangeSelection(e: any) {
    /* Check if mouse is down on current selected range */
    if (startPos <= e.evt.layerX && e.evt.layerX <= startPos + range) {
      return
    }

    /* Set new start of selected range */
    setMouseDown(true)
    setStartPos(Math.floor(e.evt.layerX / barWidth) * barWidth)
    setRange(0)
  }

  function changeRangeSelection(e: any) {
    /* Update end of selected range */
    if (isMouseDown) {
      if (startPos < e.evt.layerX) {
        setRange(Math.floor((e.evt.layerX - startPos) / barWidth) * barWidth)
      } else {
        setRange(
          0 - Math.floor((startPos - e.evt.layerX) / barWidth) * barWidth
        )
      }
    }
  }

  function endRangeSelection(e: any) {
    /* Finish end of selected range */
    if (isMouseDown) {
      if (startPos < e.evt.layerX) {
        setMouseDown(false)
        setRange(Math.floor((e.evt.layerX - startPos) / barWidth) * barWidth)
      } else {
        setMouseDown(false)
        setStartPos(Math.ceil(e.evt.layerX / barWidth) * barWidth)
        setRange(Math.floor((startPos - e.evt.layerX) / barWidth) * barWidth)
      }
    }
  }

  function onDragOfSelectedRange(pos: Vector2d) {
    if (pos.x < 0) {
      setStartPos(0)

      return {
        x: 0,
        y: WIDGET_PADDING_TOP
      }
    } else if (pos.x + range > cWidth) {
      setStartPos(cWidth - range)

      return {
        x: cWidth - range,
        y: WIDGET_PADDING_TOP
      }
    } else {
      setStartPos(Math.floor(pos.x / barWidth) * barWidth)

      return {
        x: Math.floor(pos.x / barWidth) * barWidth,
        y: WIDGET_PADDING_TOP
      }
    }
  }

  function onDragOfPosX1(pos: Vector2d) {
    if (pos.x <= 0) {
      setStartPos(0)

      return {
        x: 0,
        y: WIDGET_PADDING_TOP
      }
    } else {
      if (startPos + range - pos.x < barWidth) {
        setRange(barWidth)
        setStartPos(startPos + range - barWidth)

        return {
          x: startPos + range - barWidth,
          y: WIDGET_PADDING_TOP
        }
      }

      const posX = Math.floor(pos.x / barWidth) * barWidth

      setStartPos(posX)
      setRange(range + (startPos - posX))

      return {
        x: posX,
        y: WIDGET_PADDING_TOP
      }
    }
  }

  function onDragOfPosX2(pos: Vector2d) {
    if (pos.x >= cWidth) {
      return {
        x: cWidth - WIDGET_RANGE_PADDING,
        y: WIDGET_PADDING_TOP
      }
    } else {
      if (pos.x - startPos < barWidth) {
        setRange(barWidth)

        return {
          x: startPos + barWidth - WIDGET_RANGE_PADDING,
          y: WIDGET_PADDING_TOP
        }
      }

      const posX = Math.ceil(pos.x / barWidth) * barWidth

      setRange(posX - startPos)

      return {
        x: posX - WIDGET_RANGE_PADDING,
        y: WIDGET_PADDING_TOP
      }
    }
  }

  function onStartDatePicked(date: Date) {
    const diffDays = rangeMax - dayjs().diff(dayjs(date), 'day')
    const newStartPos = (barCount / rangeMax) * diffDays * barWidth
    setStartPos(newStartPos)
    setRange(startPos + range - newStartPos)
  }

  function onEndDatePicked(date: Date) {
    const diffDays = rangeMax - dayjs().diff(dayjs(date), 'day')
    const endPos = (barCount / rangeMax) * diffDays * barWidth
    setRange(endPos - startPos)
  }

  /* Render bars */
  function renderBars() {
    return (
      <Layer>
        {data.data.map((value, idx) => {
          const xPos = (cWidth / barCount) * idx
          const width = (cWidth / barCount) * 0.5
          const height =
            ((WIDGET_HEIGHT - WIDGET_RANGE_PADDING * 2 - 12) * value) / 100

          const minValue = Math.min(startPos, startPos + range)
          const maxValue = Math.max(startPos, startPos + range)
          const isInSelectedRange = xPos >= minValue && xPos + width <= maxValue

          return (
            <Rect
              key={idx}
              x={xPos}
              y={WIDGET_HEIGHT - WIDGET_RANGE_PADDING}
              width={width}
              height={-height}
              fill={isInSelectedRange ? '#7857FF' : '#8B8B8B'}
              shadowBlur={1}
              sceneFunc={(context, shape) => {
                const width = shape.width(),
                  height = shape.height()

                context.beginPath()
                context.moveTo(width / 2, 0)
                context.arcTo(width, 0, width, height, 1.6)
                context.arcTo(width, height, 0, height, 1.6)
                context.arcTo(0, height, 0, 0, 1.6)
                context.arcTo(0, 0, width, 0, 1.6)

                context.fillStrokeShape(shape)
              }}
            />
          )
        })}
      </Layer>
    )
  }

  return (
    <ResizeDetector handleWidth onResize={onWidthChanged}>
      {({
        componentRef
      }: {
        componentRef: React.RefObject<HTMLDivElement>
      }) => (
        <div className='th-time-line' ref={componentRef}>
          <div className='th-time-line-header'>
            <div className='th-time-line-header-title'>
              <span>Timeline</span>
              <Tooltip tooltip='tooltip' trigger='hover'>
                <span>ⓘ</span>
              </Tooltip>
            </div>

            <div className='th-time-line-period'>
              {descriptive.enabled && (
                <button
                  className={cn(
                    { active: descriptive.filters },
                    'th-time-analytics'
                  )}
                  onClick={() =>
                    setOption('descriptive.filters', !descriptive.filters)
                  }
                >
                  Analytics Filters
                </button>
              )}
              <button
                className={cn({ active: rangeMax === DAY_COUNT.WEEK })}
                onClick={() => setRangeMax(DAY_COUNT.WEEK)}
              >
                1 W
              </button>
              <button
                className={cn({ active: rangeMax === DAY_COUNT.MONTH })}
                onClick={() => setRangeMax(DAY_COUNT.MONTH)}
              >
                1 M
              </button>
              <button
                className={cn({ active: rangeMax === DAY_COUNT.MONTH3 })}
                onClick={() => setRangeMax(DAY_COUNT.MONTH3)}
              >
                3 M
              </button>
              <button
                className={cn({ active: rangeMax === DAY_COUNT.MONTH6 })}
                onClick={() => setRangeMax(DAY_COUNT.MONTH6)}
              >
                6 M
              </button>
              <button
                className={cn({ active: rangeMax === DAY_COUNT.YEAR })}
                onClick={() => setRangeMax(DAY_COUNT.YEAR)}
              >
                1 Y
              </button>
              <button
                className={cn({ active: rangeMax === DAY_COUNT.YEAR2 })}
                onClick={() => setRangeMax(DAY_COUNT.YEAR2)}
              >
                2 Y
              </button>
              <button
                className={cn({ active: rangeMax === DAY_COUNT.YEAR5 })}
                onClick={() => setRangeMax(DAY_COUNT.YEAR5)}
              >
                5 Y
              </button>
            </div>

            <SvgClose className='th-time-line-close' />
          </div>

          <div className='th-time-line-slider'>
            <Stage
              width={cWidth}
              height={WIDGET_HEIGHT}
              onMouseDown={startRangeSelection}
              onMouseMove={changeRangeSelection}
              onMouseUp={endRangeSelection}
              onMouseLeave={endRangeSelection}
            >
              {renderBars()}

              <Layer>
                {range !== 0 && (
                  <Rect
                    x={startPos}
                    y={WIDGET_PADDING_TOP}
                    width={range}
                    height={WIDGET_HEIGHT - WIDGET_PADDING_TOP}
                    fill={'black'}
                    opacity={0.1}
                    shadowBlur={1}
                    draggable
                    dragBoundFunc={onDragOfSelectedRange}
                  />
                )}
                {range !== 0 && startPos > -1 && (
                  <Rect
                    x={Math.min(startPos, startPos + range)}
                    y={WIDGET_PADDING_TOP}
                    width={6}
                    height={WIDGET_HEIGHT - WIDGET_PADDING_TOP}
                    fill={'#6354E3'}
                    draggable
                    dragBoundFunc={onDragOfPosX1}
                  />
                )}
                {range !== 0 && startPos > -1 && (
                  <Rect
                    x={Math.max(startPos, startPos + range) - 6}
                    y={WIDGET_PADDING_TOP}
                    width={6}
                    height={WIDGET_HEIGHT - WIDGET_PADDING_TOP}
                    fill={'#6354E3'}
                    draggable
                    dragBoundFunc={onDragOfPosX2}
                  />
                )}
                {range !== 0 && (
                  <>
                    <Text
                      text={startDate}
                      x={startPos}
                      y={0}
                      fontSize={11}
                      fill='#A5A5A5'
                      onClick={() => setStartDateShow(prev => !prev)}
                    />
                    <Text
                      text={endDate}
                      x={Math.max(startPos + 50, startPos + range - 45)}
                      y={0}
                      fontSize={11}
                      fill='#A5A5A5'
                      onClick={() => setEndDateShow(prev => !prev)}
                    />
                  </>
                )}
              </Layer>
            </Stage>
          </div>
          <RangeDatePicker
            anchor='left top'
            day={startDate}
            minDate={dayjs()
              .subtract(rangeMax, 'day')
              .format('MM/DD/YY')}
            maxDate={endDate}
            startPos={startPos + 20}
            visible={startDateShow}
            updateDay={onStartDatePicked}
            updateVisible={setStartDateShow}
          />
          <RangeDatePicker
            anchor='right top'
            day={endDate}
            minDate={startDate}
            maxDate={dayjs().format('MM/DD/YY')}
            startPos={startPos + range - 250}
            visible={endDateShow}
            updateDay={onEndDatePicked}
            updateVisible={setEndDateShow}
          />

          <style jsx>{styles}</style>
        </div>
      )}
    </ResizeDetector>
  )
}
