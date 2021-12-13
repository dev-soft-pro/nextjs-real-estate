import { connect } from 'react-redux'
import EstimateChangeLayerPanel from './EstimateChangeLayerPanel'

const mapStateToProps = (state: TopHap.StoreState) => ({
  estimateOptions: state.preferences.map.estimateOptions
})

const mapDispatchToProps = {}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(EstimateChangeLayerPanel)
