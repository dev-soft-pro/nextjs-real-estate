import React from 'react'
import isEqual from 'lodash/isEqual'

import NearbyChart from 'containers/PropertyDetail/components/NearbyChart'
import DomPriceChart from 'containers/PropertyDetail/components/DomPriceChart'
import AuthLock from 'components/AuthLock'
import Tabs from 'components/Tabs'

import SvgBath from 'assets/images/metrics/bath.svg'
import SvgBeds from 'assets/images/metrics/bed.svg'
import SvgDate from 'assets/images/metrics/date.svg'
import SvgHome from 'assets/images/metrics/home.svg'
import SvgLot from 'assets/images/metrics/lot.svg'
import { REGION_TYPES } from 'consts'
import { Types } from 'store/actions/properties'

import styles from './styles.scss?type=global'

interface StatisticsProps {
  asyncStatus: TopHap.GlobalState['status']
  bounds: TopHap.Bounds
  isSiderVisible: boolean
  neighborhood: TopHap.PropertiesState['neighborhood']
  neighborhoodDom: TopHap.PropertiesState['neighborhoodDom']
  getNeighborhood: TopHap.PropertiesCreators['getNeighborhood']
  getNeighborhoodDom: TopHap.PropertiesCreators['getNeighborhoodDom']
  place: TopHap.PreferencesState['place']
  drawings: TopHap.PreferencesState['drawings']
  siderMode: TopHap.UIState['siderMode']
}

interface StatisticsState {
  type: 'age' | 'bathrooms' | 'bedrooms' | 'living_area' | 'lot_size_acres'
  dateOption: TopHap.PropertiesState['neighborhoodDom']['dom']
}

export default class Statistics extends React.PureComponent<
  StatisticsProps,
  StatisticsState
> {
  constructor(props: StatisticsProps) {
    super(props)

    this.state = {
      type: 'living_area',
      dateOption: props.neighborhoodDom.dom
    }
  }

  componentDidMount() {
    if (!this.props.neighborhoodDom.items.length) {
      this.updateNeighborhood(false)
      this.updateNeighborhood(true)
    }
  }

  componentDidUpdate(prevProps: StatisticsProps) {
    const { bounds, drawings, isSiderVisible, place, siderMode } = this.props

    if (isSiderVisible && siderMode === 'statistics') {
      if (!isEqual(prevProps.bounds, bounds)) {
        const filterable =
          (place && REGION_TYPES.includes(place.place_type[0])) ||
          drawings.length
        if (!filterable) {
          this.updateNeighborhood(false)
          this.updateNeighborhood(true)
        }
      }

      if (prevProps.place !== place || prevProps.drawings !== drawings) {
        const filterable =
          (place && REGION_TYPES.includes(place.place_type[0])) ||
          drawings.length
        if (filterable) {
          this.updateNeighborhood(false)
          this.updateNeighborhood(true)
        }
      }

      if (
        prevProps.isSiderVisible !== isSiderVisible ||
        prevProps.siderMode !== siderMode
      ) {
        this.updateNeighborhood(false)
        this.updateNeighborhood(true)
      }
    }
  }

  onChangeTab = (ev: any, value?: any) => {
    this.setState({ type: value })
  }

  onChangeDateOption = (dateOption: any) => {
    this.setState({ dateOption }, () => {
      this.updateNeighborhood(true)
    })
  }

  updateNeighborhood = (dom: boolean) => {
    const {
      drawings,
      place,
      bounds,
      getNeighborhood,
      getNeighborhoodDom
    } = this.props
    const { dateOption } = this.state

    const service = dom ? getNeighborhoodDom : getNeighborhood
    if (drawings.length) {
      service({
        shape: {
          type: 'MultiPolygon',
          coordinates: drawings.map(e => e.geometry.coordinates)
        },
        dom: dom ? { from: dateOption.from, interval: dateOption.interval } : {}
      })
    } else if (place && REGION_TYPES.includes(place.place_type[0])) {
      service({
        zones: [place.id],
        dom: dom ? { from: dateOption.from, interval: dateOption.interval } : {}
      })
    } else {
      service({
        shape: {
          type: 'Polygon',
          coordinates: [
            [
              [bounds[0][0], bounds[0][1]],
              [bounds[0][0], bounds[1][1]],
              [bounds[1][0], bounds[1][1]],
              [bounds[1][0], bounds[0][1]],
              [bounds[0][0], bounds[0][1]]
            ]
          ]
        },
        dom: dom ? { from: dateOption.from, interval: dateOption.interval } : {}
      })
    }
  }

  render() {
    const { asyncStatus, neighborhood, neighborhoodDom } = this.props
    const { type, dateOption } = this.state

    return (
      <section className='th-statistics-section'>
        <Tabs className='mt-3' value={type} onChange={this.onChangeTab}>
          <Tabs.Tab
            icon={<SvgHome />}
            label='Living Area'
            value='living_area'
          />
          <Tabs.Tab icon={<SvgLot />} label='Lot Area' value='lot_size_acres' />
          <Tabs.Tab icon={<SvgBeds />} label='Bedrooms' value='bedrooms' />
          <Tabs.Tab icon={<SvgBath />} label='Bathrooms' value='bathrooms' />
          <Tabs.Tab icon={<SvgDate />} label='Property Age' value='age' />
        </Tabs>
        <div className='th-chart-container'>
          <AuthLock event='Statistics' />
          <NearbyChart
            selfIndex={-1}
            data={neighborhood[type]}
            loading={asyncStatus[Types.GET_NEIGHBORHOOD] === 'request'}
            height={300}
          />
        </div>
        <div className='th-chart-container'>
          <AuthLock event='Statistics' />
          <DomPriceChart
            data={neighborhoodDom.items}
            dateOption={dateOption}
            onChangeDateOption={this.onChangeDateOption}
            loading={asyncStatus[Types.GET_NEIGHBORHOOD_DOM] === 'request'}
            height={300}
          />
        </div>
        <style jsx>{styles}</style>
      </section>
    )
  }
}
