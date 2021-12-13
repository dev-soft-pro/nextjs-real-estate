import { connect } from 'react-redux'
import RotationControl from './RotationControl'
import { Creators } from 'store/actions/preferences'

const mapStateToProps = (state: TopHap.StoreState) => ({
  elevations: state.preferences.map.elevations,
  viewport: state.preferences.map.viewport
})

const mapDispatchToProps = {
  setMapOption: Creators.setMapOption
}

export default connect(mapStateToProps, mapDispatchToProps)(RotationControl)
