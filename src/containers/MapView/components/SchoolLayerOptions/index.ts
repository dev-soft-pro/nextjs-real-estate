import { connect } from 'react-redux'
import SchoolLayerOptions from './SchoolLayerOptions'

const mapStateToProps = (state: TopHap.StoreState) => ({
  schoolOptions: state.preferences.map.schoolOptions
})

const mapDispatchToProps = {}

export default connect(mapStateToProps, mapDispatchToProps)(SchoolLayerOptions)
