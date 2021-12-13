import { connect } from 'react-redux'
import EstimateSoldRatioLayerOptions from './EstimateSoldRatioLayerOptions'

const mapStateToProps = (state: TopHap.StoreState) => ({
  estimateSoldRatioOptions: state.preferences.map.estimateSoldRatioOptions
})

const mapDispatchToProps = {}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(EstimateSoldRatioLayerOptions)
