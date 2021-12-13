import { connect } from 'react-redux'
import RemoveBoundary from './RemoveBoundary'
import { Creators } from 'store/actions/preferences'

const mapStateToProps = (state: TopHap.StoreState) => ({
  drawings: state.preferences.drawings,
  elevations: state.preferences.map.elevations,
  place: state.preferences.place
})

const mapDispatchToProps = {
  updatePreferences: Creators.updateStates
}

export default connect(mapStateToProps, mapDispatchToProps)(RemoveBoundary)
