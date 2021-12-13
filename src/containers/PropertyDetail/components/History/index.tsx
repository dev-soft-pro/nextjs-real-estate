import React, { useMemo, useState } from 'react'
import Tabs from 'components/Tabs'
import HistoryChart from '../HistoryChart'
import HistoryTimeline from '../HistoryTimeline'

interface Props {
  history: TopHap.PropertyHistory[]
  estimates: {
    key: number
    price: number
  }[]
}

const History: React.FC<Props> = (props: Props) => {
  const [type, setType] = useState<TopHap.TransactionType | 'All'>('All')
  const history = useMemo(() => {
    if (type === 'All') {
      return props.history
    } else {
      return props.history.filter(e => e._source.Facts.TransactionType === type)
    }
  }, [props.history, type])

  function handleTabChange(_ev: any, value?: TopHap.TransactionType | 'All') {
    if (value) {
      setType(value)
    }
  }

  return (
    <div>
      <Tabs value={type} onChange={handleTabChange}>
        <Tabs.Tab label='Full' value='All' />
        <Tabs.Tab label='Listing' value='Listing' />
        <Tabs.Tab label='Deed' value='Deed' />
        <Tabs.Tab label='Permit' value='Permit' />
        <Tabs.Tab label='Tax' value='Tax' />
        <Tabs.Tab label='Foreclosure' value='Foreclosure' />
        <Tabs.Tab label='Loan' value='Loan' />
      </Tabs>
      <HistoryChart estimates={props.estimates || []} history={history} />
      <HistoryTimeline history={history} />
    </div>
  )
}

export default History
