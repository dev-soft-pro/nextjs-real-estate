import { connect } from 'react-redux'
import ElevationControls from './ElevationControls'
import { Creators } from 'store/actions/preferences'
import { Creators as PropertiesCreators } from 'store/actions/properties'

const mapStateToProps = (state: TopHap.StoreState) => ({
  enabled: state.preferences.map.elevations,
  place: state.preferences.place
})

const mapDispatchToProps = {
  setMapOption: Creators.setMapOption,
  resetElevations: PropertiesCreators.resetElevations,
  toggleElevation: PropertiesCreators.toggleElevation
}

export default connect(mapStateToProps, mapDispatchToProps)(ElevationControls)
