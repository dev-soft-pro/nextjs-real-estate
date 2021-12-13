import { connect } from 'react-redux'
import UniqueZonesLayerPanel from './UniqueZonesLayerPanel'

const mapStateToProps = (state: TopHap.StoreState) => ({
  uniqueZonesOptions: state.preferences.map.uniqueZonesOptions
})

const mapDispatchToProps = {}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(UniqueZonesLayerPanel)
