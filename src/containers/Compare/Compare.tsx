import { useRef, useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import ColorHash from 'color-hash'
import { OpUnitType } from 'dayjs'
import lz from 'lz-string'
import arrayDiff from 'lodash/difference'
import isEqual from 'lodash/isEqual'
import { ScrollSync, ScrollSyncPane } from 'react-scroll-sync'

import Button from 'components/Button'
import OverlaySpinner from 'components/OverlaySpinner'
import AddModal from './components/AddModal'
import CompareChart from './components/CompareChart'
import ComparableCard from './components/ComparableCard'
import ComparableContent from './components/ComparableContent'
import Header from './components/Header'

import SvgAdd from 'assets/images/icons/add_circle_outline.svg'
import { COMPARE_PAGE } from 'consts/url'
import { Types } from 'store/actions/compare'
import { useIsMounted } from 'utils/hook'
import { state2CompareUrl } from 'utils/url'
import { logEvent } from 'services/analytics'
import styles from './styles.scss?type=global'

const colorHash = new ColorHash()

interface CompareProps {
  asyncStatus: TopHap.GlobalState['status']
  comparables: TopHap.Comparable[]
  dateOption: TopHap.CompareState['preferences']['dateOption']
  preferences: TopHap.CompareState['preferences']
  addComparables: TopHap.CompareCreators['addComparables']
  removeComparable: TopHap.CompareCreators['removeComparable']
  setComparables: TopHap.CompareCreators['setComparables']
  setState: TopHap.CompareCreators['setState']
  updateComparables: TopHap.CompareCreators['updateComparables']
}

export default function Compare({
  asyncStatus,
  comparables,
  dateOption,
  preferences,
  addComparables,
  removeComparable,
  updateComparables,
  setState
}: CompareProps) {
  const { primary, accuracy, excludes, type, metric, ids, filter } = preferences
  const [isAddVisible, showAddModal] = useState(false)
  const [expandedCategories, setExpandedCategories] = useState<string[]>([])
  const colors = useRef<{ [key: string]: string }>({})
  const router = useRouter()

  useEffect(() => {
    parseHash()
  }, [])

  useEffect(() => {
    if (!isMounted.current) return
    router.push(COMPARE_PAGE, state2CompareUrl(preferences), { shallow: true })
  }, [preferences])

  useEffect(() => {
    if (!isMounted.current) return

    const diff = arrayDiff(
      preferences.ids,
      comparables.map(e => e.place.id)
    )
    if (diff.length) {
      addComparables(diff)
    }
  }, [preferences.ids])

  useEffect(() => {
    if (!isMounted.current) return
    if (comparables.length) {
      updateComparables()
    }
  }, [preferences.filter, preferences.dateOption])

  useEffect(() => {
    comparables.forEach(e => {
      if (!colors.current[e.place.id]) {
        colors.current[e.place.id] = colorHash.hex(e.place.place_name)
      }
    })
  }, [comparables])

  const isMounted = useIsMounted()

  function expandCategory(categoryId: string, expanded: boolean) {
    if (expanded) {
      setExpandedCategories([...expandedCategories, categoryId])
    } else {
      setExpandedCategories(expandedCategories.filter(e => e !== categoryId))
    }
  }

  function setOption(option: string, value: any, update?: boolean) {
    setState(`preferences.${option}`, value, update)
  }

  function parseHash() {
    const { params } = router.query
    if (!params) return

    const newPreferences: Partial<TopHap.CompareState['preferences']> = {}

    if (params[0]) {
      if (params[0] !== '_') {
        const ids = params[0]
        newPreferences.ids = ids.split(',')
      }
    }

    if (params[1]) {
      const options = JSON.parse(
        lz.decompressFromEncodedURIComponent(params[1])
      )

      if (options.type !== type) newPreferences.type = options.type
      if (options.metric !== metric) newPreferences.metric = options.metric
      if (options.primary !== primary) newPreferences.primary = options.primary
      if (options.accuracy !== accuracy)
        newPreferences.accuracy = options.accuracy
      if (!isEqual(options.dateOption, dateOption))
        newPreferences.dateOption = options.dateOption
      if (!isEqual(options.excludes, excludes))
        newPreferences.excludes = options.excludes
      if (!isEqual(options.filter, filter))
        newPreferences.filter = options.filter
    }

    setState('preferences', newPreferences, true)
  }

  function toggleAddModal() {
    showAddModal(!isAddVisible)
  }

  function onAdd(place: TopHap.Place) {
    if (!comparables.find(e => e.place.id === place.id)) {
      setOption('ids', [...ids, place.id])
    }
    showAddModal(false)

    logEvent('compare', 'add_comparable', null, { id: place.id })
  }

  function onRemove(index: number) {
    setOption(
      'ids',
      ids.filter(e => e !== comparables[index].place.id)
    )
    removeComparable(comparables[index])
    delete colors.current[comparables[index].place.id]

    if (primary === index) setOption('primary', 0)
    else if (primary > index) setOption('primary', primary - 1)

    logEvent('compare', 'remove_comparable', null, {
      id: comparables[index].place.id
    })
  }

  function toggleVisibility(comparable: TopHap.Comparable) {
    setOption('excludes', {
      ...excludes,
      [comparable.place.id]: !excludes[comparable.place.id]
    })

    logEvent('compare', 'show_comparable', null, {
      id: comparable.place.id,
      visible: excludes[comparable.place.id]
    })
  }

  function onTypeChange(newType: TopHap.CompareMetricGroup) {
    setOption('type', newType)

    if (type !== newType) {
      // select the first metric of new type
      if (newType === 'Estimate') {
        setOption('metric', 'Estimate')

        // set dateOption as 2M when it is too small
        if (dateOption[1] === 'w' || isEqual(dateOption, [-1, 'M'])) {
          setOption('dateOption', [-2, 'M'])
        }
      } else {
        setOption('metric', 'Health')
      }
    }
  }

  function onMetricChange(metric: TopHap.CompareMetric) {
    setOption('metric', metric)
  }

  function onDateOptionChange(option: [number, OpUnitType]) {
    setOption('dateOption', option)
  }

  return (
    <div className='th-compare'>
      <Header onAdd={onAdd} accuracy={accuracy} setOption={setOption} />

      <div className='th-page-content'>
        <h1 className='th-page-title'>
          Compare Real Estate Markets and Properties
        </h1>

        <div className='d-flex justify-content-between'>
          <Button
            className='th-add-button'
            disabled={isAddVisible}
            onClick={toggleAddModal}
          >
            <SvgAdd className='th-icon' />
            <span>Add property or region</span>
          </Button>
        </div>

        <hr className='th-breaker' />

        {comparables.length ? (
          <CompareChart
            comparables={comparables}
            colors={colors.current}
            dateOption={dateOption}
            excludes={excludes}
            showAccuracy={accuracy}
            type={type}
            metric={metric}
            onTypeChange={onTypeChange}
            onMetricChange={onMetricChange}
            onDateOptionChange={onDateOptionChange}
          />
        ) : null}

        {comparables.length ? (
          <ScrollSync>
            <div className='th-comparables'>
              <ScrollSyncPane>
                <div className='th-comparables-header'>
                  <ComparableCard
                    color={colors.current[comparables[primary].place.id]}
                    comparable={comparables[primary]}
                    hide={excludes[comparables[primary].place.id]}
                    isPrimary
                    remove={() => onRemove(primary)}
                    setPrimary={() => setOption('primary', primary)}
                    toggleVisiblity={() =>
                      toggleVisibility(comparables[primary])
                    }
                  />
                  {comparables.map((e, index) =>
                    index === primary ? null : (
                      <ComparableCard
                        key={e.place.id}
                        color={colors.current[e.place.id]}
                        comparable={e}
                        hide={excludes[e.place.id]}
                        remove={() => onRemove(index)}
                        setPrimary={() => setOption('primary', index)}
                        toggleVisiblity={() => toggleVisibility(e)}
                      />
                    )
                  )}
                  <div className='th-new-comparable' onClick={toggleAddModal}>
                    <SvgAdd className='th-icon' />
                    <span>Add property or region</span>
                  </div>
                </div>
              </ScrollSyncPane>

              <ScrollSyncPane>
                <div className='th-comparables-body'>
                  <ComparableContent
                    comparable={comparables[primary]}
                    expandedCategories={expandedCategories}
                    expandCategory={expandCategory}
                    isPrimary
                    primary={comparables[primary]}
                  />
                  {comparables.map((e, index) =>
                    index === primary ? null : (
                      <ComparableContent
                        key={e.place.id}
                        comparable={e}
                        expandedCategories={expandedCategories}
                        expandCategory={expandCategory}
                        primary={comparables[primary]}
                      />
                    )
                  )}
                  <div className='th-new-comparable' onClick={toggleAddModal} />
                </div>
              </ScrollSyncPane>
            </div>
          </ScrollSync>
        ) : null}

        <AddModal
          visible={isAddVisible}
          onAdd={onAdd}
          onClose={toggleAddModal}
        />
        <OverlaySpinner
          visible={
            asyncStatus[Types.ADD_COMPARABLES] === 'request' ||
            asyncStatus[Types.UPDATE_COMPARABLES] === 'request'
          }
        />
      </div>

      <style jsx>{styles}</style>
    </div>
  )
}
