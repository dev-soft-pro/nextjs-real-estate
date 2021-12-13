import { connect } from 'react-redux'
import Map from './Map'
import { Creators as PreferencesCreators } from 'store/actions/preferences'
import { Creators } from 'store/actions/properties'
import { Creators as UICreators } from 'store/actions/ui'

const mapStateToProps = (state: TopHap.StoreState) => ({
  rentalEstimate: state.preferences.filter.rental
})

const mapDispatchToProps = {
  setMapOption: PreferencesCreators.setMapOption,
  resetProperties: Creators.resetProperties,
  resetMapProperties: Creators.resetMapProperties,
  getAggregations: Creators.getAggregations,
  getProperties: Creators.getProperties,
  getMapProperties: Creators.getMapProperties,
  getBoundary: Creators.getBoundary,
  getAnalyticsAggregate: Creators.getAnalyticsAggregate,
  getAnalyticsSearch: Creators.getAnalyticsSearch,
  toggleElevation: Creators.toggleElevation,
  getElevations: Creators.getElevations,
  getPermitTypes: Creators.getPermitTypes,
  getZones: Creators.getZones,
  addDrawing: PreferencesCreators.addDrawing,
  updateDrawing: PreferencesCreators.updateDrawing,
  removeDrawing: PreferencesCreators.removeDrawing,
  updatePreferences: PreferencesCreators.updateStates,
  updateSider: UICreators.updateSider,
  updateUI: UICreators.updateStates
}

export default connect(mapStateToProps, mapDispatchToProps)(Map)
