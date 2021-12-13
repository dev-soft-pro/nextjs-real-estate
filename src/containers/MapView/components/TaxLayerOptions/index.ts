import { connect } from 'react-redux'
import TaxLayerOptions from './TaxLayerOptions'

const mapStateToProps = (state: TopHap.StoreState) => ({
  taxOptions: state.preferences.map.taxOptions
})

const mapDispatchToProps = {}

export default connect(mapStateToProps, mapDispatchToProps)(TaxLayerOptions)
