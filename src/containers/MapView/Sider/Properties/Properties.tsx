import React from 'react'
import { ReactReduxContext } from 'react-redux'
import {
  AutoSizer,
  Index,
  List,
  ListProps,
  ListRowProps,
  WindowScroller,
  InfiniteLoader,
  InfiniteLoaderChildProps
} from 'react-virtualized'
import { useRouter } from 'next/router'
import CircularProgress from '@material-ui/core/CircularProgress'

import SortOptions from './SortOptions'
import PropertyDetail from 'containers/PropertyDetail'
import PropertyCard from 'components/PropertyCard'
import { COMPARE_PAGE } from 'consts/url'
import { logEvent } from 'services/analytics'
import { Types } from 'store/actions/properties'
import { setIn } from 'utils/object'
import { state2CompareUrl } from 'utils/url'

import 'react-virtualized/styles.css'
import styles from './styles.scss?type=global'

interface PropertiesListProps {
  asyncStatus: TopHap.GlobalState['status']
  isMobile: boolean
  isWindowScroll: boolean
  mls: TopHap.PropertiesState['mls']
  mode: TopHap.UIState['sider']['properties']
  properties: TopHap.PropertiesState['list']
  rentalEstimate: boolean
  siderSize: TopHap.UIState['sider']['size']
  getProperties: TopHap.PropertiesCreators['getProperties']
  setHovered: (hovered?: TopHap.Property) => void
  setMapOption: TopHap.PreferencesCreators['setMapOption']
  updateMode(payload: any): void
}

function Properties({
  asyncStatus,
  isMobile,
  isWindowScroll,
  mls,
  mode,
  properties,
  rentalEstimate,
  siderSize,
  getProperties,
  setHovered,
  setMapOption,
  updateMode
}: PropertiesListProps) {
  const context = React.useContext(ReactReduxContext)
  const refList = React.useRef<List | null>(null)
  const router = useRouter()

  React.useEffect(() => {
    return setHovered
  }, [])

  React.useEffect(() => {
    if (refList.current && mode.id) {
      const colCount = siderSize === 'Wide' ? 2 : 1
      let index = mode.id ? items.findIndex(e => e.id === mode.id) : -1
      index = index === -1 ? 0 : Math.ceil(index / colCount)

      refList.current.scrollToRow(index)
    }
  }, [refList.current, mode.id])

  const hasMore = Boolean(properties.cursor)
  const { items } = properties
  const rowCount =
    siderSize === 'Wide' ? Math.ceil(items.length / 2) : items.length

  function onResize() {
    if (refList.current) {
      refList.current.recomputeRowHeights()
    }
  }

  function isRowLoaded({ index }: Index) {
    return index < rowCount
  }

  function loadMore() {
    if (asyncStatus[Types.GET_PROPERTIES] === 'request')
      return Promise.resolve()
    if (!hasMore) return Promise.resolve()

    getProperties()
    logEvent('listings', 'listings_next_page')

    // TODO: return proper promise to know when loading finishes
    return Promise.resolve()
  }

  function showLocation(item: TopHap.Property) {
    setHovered()

    setMapOption(
      'viewport',
      {
        center: item.location,
        zoom: 18,
        updatedBy: 'USER'
      },
      true
    )
  }

  function viewDetail(item: TopHap.Property) {
    updateMode({ mode: 'Detail', id: item.id })
  }

  function onCompare(item: TopHap.Property) {
    const store: TopHap.StoreState = context.store.getState()
    let { preferences } = store.compare
    if (!preferences.ids.find(e => e === item.id)) {
      preferences = setIn(preferences, 'ids', [...preferences.ids, item.id])
    }
    router.push(COMPARE_PAGE, state2CompareUrl(preferences), { shallow: true })
  }

  function rowRenderer({ key, index, isScrolling, style }: ListRowProps) {
    const colCount = siderSize === 'Wide' ? 2 : 1
    if (index < rowCount) {
      return (
        <div key={key} style={style} className='th-row'>
          {Array(colCount)
            .fill(0)
            .map((_: any, key: number) => {
              const itemIndex = index * colCount + key

              if (!items[itemIndex]) {
                return <div key={itemIndex} className='th-item-wrapper' />
              }

              let mlsLogo
              if (items[itemIndex] && items[itemIndex].mls) {
                const mlsInfo = mls[items[itemIndex].mls as string]
                if (mlsInfo && mlsInfo.overlay) {
                  mlsLogo = `https://s3-us-west-2.amazonaws.com/tophap-assets/mls/${mlsInfo.logo}`
                }
              }

              return (
                <div
                  key={itemIndex}
                  className='th-item-wrapper'
                  onClick={() => viewDetail(items[itemIndex])}
                >
                  <PropertyCard
                    item={items[itemIndex]}
                    mlsLogo={mlsLogo}
                    showLocation={showLocation}
                    onMouseEnter={
                      isScrolling
                        ? undefined
                        : () => setHovered(items[itemIndex])
                    }
                    onMouseLeave={isScrolling ? undefined : () => setHovered()}
                    isMobile={isMobile}
                    isScrolling={isScrolling}
                    lazyload
                    rentalEstimate={rentalEstimate}
                    compare={onCompare}
                  />
                </div>
              )
            })}
        </div>
      )
    } else {
      return (
        <div key={key} style={style} className='th-loader-wrapper'>
          <CircularProgress size={24} />
        </div>
      )
    }
  }

  function _renderList(
    props: Partial<ListProps>,
    { onRowsRendered, registerChild }: InfiniteLoaderChildProps
  ) {
    const gap = 6
    const hMargin = 10
    const vMargin = 3
    const colCount = siderSize === 'Wide' ? 2 : 1
    const infoHeight = 127

    return (
      <AutoSizer onResize={onResize}>
        {({ width, height }) => (
          <List
            width={width}
            height={height}
            className='th-properties-list'
            rowRenderer={rowRenderer}
            rowCount={hasMore ? rowCount + 1 : rowCount}
            rowHeight={
              ((width - gap * (colCount - 1) - hMargin * 2) / colCount) * 0.66 +
              infoHeight +
              vMargin * 2
            }
            overscanRowCount={2}
            onRowsRendered={onRowsRendered}
            ref={(list: List) => {
              refList.current = list
              registerChild(list)
            }}
            {...props}
          />
        )}
      </AutoSizer>
    )
  }

  if (mode.mode === 'List') {
    return (
      <div className='th-properties-panel'>
        <div className='th-panel-header'>
          <div className='th-properties-count'>{properties.total} Homes</div>
          <SortOptions />
        </div>

        <div className='th-properties'>
          <InfiniteLoader
            isRowLoaded={isRowLoaded}
            loadMoreRows={loadMore}
            rowCount={hasMore ? items.length + 1 : items.length}
          >
            {(childProps: InfiniteLoaderChildProps) => {
              return isWindowScroll ? (
                <WindowScroller>
                  {({ isScrolling, onChildScroll, scrollTop }) => {
                    return _renderList(
                      {
                        autoHeight: true,
                        scrollTop: scrollTop,
                        isScrolling: isScrolling,
                        onScroll: onChildScroll
                      },
                      childProps
                    )
                  }}
                </WindowScroller>
              ) : (
                _renderList({}, childProps)
              )
            }}
          </InfiniteLoader>
        </div>

        <style jsx>{styles}</style>
      </div>
    )
  } else {
    const id = mode.id as string
    return (
      <div className='th-properties-panel'>
        <div className='th-detail' id='th_detail'>
          <PropertyDetail
            id={id}
            containerId='th_detail'
            mode='Component'
            onBack={() => updateMode({ mode: 'List' })}
          />
        </div>
        <style jsx>{styles}</style>
      </div>
    )
  }
}

export default React.memo(Properties)
