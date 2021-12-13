import { connect } from 'react-redux'
import Legend from './Legend'
import { Creators } from 'store/actions/preferences'
import { Creators as UICreators } from 'store/actions/ui'

const mapStateToProps = (state: TopHap.StoreState) => ({
  isMobile: state.global.isMobile,
  descriptive: state.preferences.map.descriptive,
  elevations: state.preferences.map.elevations,
  expanded: state.ui.isLegendExpanded,
  permitOptions: state.preferences.map.permitOptions,
  permitsTypes: state.properties.permits.types,
  profitOptions: state.preferences.map.profitOptions,
  propertiesOptions: state.preferences.map.properties,
  properties: {
    aggregationsCounts: state.properties.aggregations.counts,
    items: state.properties.map.items,
    descriptive: state.properties.descriptive,
    descriptiveParcels: state.properties.descriptiveParcels
  },
  zoom: state.preferences.map.viewport.zoom
})

const mapDispatchToProps = {
  setMapOption: Creators.setMapOption,
  setExpanded: (isLegendExpanded: boolean) =>
    UICreators.updateStates({ isLegendExpanded })
}

export default connect(mapStateToProps, mapDispatchToProps)(Legend)
