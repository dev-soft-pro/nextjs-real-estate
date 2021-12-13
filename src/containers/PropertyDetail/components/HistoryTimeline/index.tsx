import React from 'react'
import commaNumber from 'comma-number'
import dayjs from 'dayjs'

import AuthLock from 'components/AuthLock'
import Button from 'components/Button'
import SvgCollapse from 'assets/images/icons/expand_less.svg'
import SvgExpand from 'assets/images/icons/expand_more.svg'
import styles from './styles.scss?type=global'

function HistoryEvent({
  type,
  date,
  title,
  detail,
  event
}: {
  type: TopHap.Facts['TransactionType']
  date: number
  title: React.ReactNode
  detail: React.ReactNode
  event: TopHap.PropertyHistory
}) {
  const [expanded, setExpanded] = React.useState(false)

  /**
   * render indicator depending on 'event'
   * th-active-indicator, th-sold-indicator, th-removed-indicator are also supported
   */
  function _renderIndicator() {
    return (
      <div className='th-triangle-indicator'>
        <div className='th-inner-triangle' />
      </div>
    )
  }

  function _renderExpanded() {
    return (
      <>
        <div className='th-event-title'>{type}</div>
        <div className='th-event-detail'>
          {type === 'Permit' && (
            <AuthLock dark event='history_timeline_permit' />
          )}
          {title}
          {detail}
        </div>
      </>
    )
  }

  function _renderSimple() {
    return (
      <>
        <div className='th-event-title'>{type}</div>
        <div className='th-event-detail'>
          {type === 'Permit' && (
            <AuthLock dark event='history_timeline_permit' />
          )}
          {title}
        </div>
      </>
    )
  }

  function toggle() {
    setExpanded(!expanded)
  }

  return (
    <li className='th-history-event'>
      <Button className='th-collapse-button' onClick={toggle}>
        {expanded ? <SvgCollapse /> : <SvgExpand />}
      </Button>
      <div className='th-date'>{dayjs(date).format('D MMM, YYYY')}</div>
      <div className='th-indicator'>
        <div className='th-v-line' />
        {_renderIndicator()}
      </div>
      <div className='th-content'>
        {expanded ? _renderExpanded() : _renderSimple()}
      </div>
    </li>
  )
}

export default function HistoryTimeline({
  history
}: {
  history: TopHap.PropertyHistory[]
}) {
  const items = React.useMemo(() => {
    return history
      .map((e: TopHap.PropertyHistory) => {
        let date = new Date(e._source.Facts.TransactionDate).getTime(),
          detail,
          title,
          valid = true
        const type = e._source.Facts.TransactionType

        if (type === 'Permit') {
          title = <div>{e._source.Facts.Description}</div>
        } else if (type === 'Deed') {
          title = <div>${commaNumber(e._source.Facts.TransactionAmount)}</div>
          valid = Number(e._source.Facts.TransactionAmount) > 0
        } else if (type === 'Tax') {
          date = new Date(e._source.Facts.TaxDate as string).getTime()
          title = <div>${commaNumber(e._source.Facts.TransactionAmount)}</div>
          detail = (
            <div>
              Tax Year Assessed: {e._source.TaxYearAssessed}
              <br />
              Tax Assessed Value Total: $
              {commaNumber(e._source.TaxAssessedValueTotal)}
              <br />
              Tax Assessed Improvements Perc:{' '}
              {e._source.TaxAssessedImprovementsPerc}%
              <br />
              Tax Market Value Total: $
              {commaNumber(e._source.TaxMarketValueTotal)}
              <br />
              Tax Market Value Improvements: $
              {e._source.TaxMarketValueImprovements}
            </div>
          )
        } else if (type === 'Listing') {
          date = new Date(e._source.Facts.ListDate).getTime()
          detail = (
            <div>
              Date Listed:{' '}
              {dayjs(e._source.Facts.ListDate).format('MM/DD/YYYY')}, List
              Price: ${commaNumber(e._source.Facts.ListAmount)} - $
              {commaNumber(e._source.Facts.ListAmountPerSqft)}/ ft<sup>2</sup>
            </div>
          )
          title =
            e._source.Facts.TophapStatus === 'Sold' ? (
              <div>
                Sold Price: ${commaNumber(e._source.Facts.TransactionAmount)} -
                ${commaNumber(e._source.Facts.TransactionAmountPerSqft)}/ ft
                <sup>2</sup>
              </div>
            ) : (
              detail
            )
        }

        return {
          date,
          type,
          title,
          detail,
          valid,
          event: e
        }
      })
      .filter(e => e.valid)
      .sort((a, b) => b.date - a.date)
  }, [history])

  return (
    <ul className='th-history-timeline'>
      {items.map((e, index) => (
        <HistoryEvent key={index} {...e} />
      ))}

      <style jsx>{styles}</style>
    </ul>
  )
}
