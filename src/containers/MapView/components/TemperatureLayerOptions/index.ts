import { connect } from 'react-redux'
import TemperatureLayerOptions from './TemperatureLayerOptions'

const mapStateToProps = (state: TopHap.StoreState) => ({
  temperatureOptions: state.preferences.map.temperatureOptions
})

const mapDispatchToProps = {}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(TemperatureLayerOptions)
