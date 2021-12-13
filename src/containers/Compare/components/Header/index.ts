import { connect } from 'react-redux'
import Header from './Header'

const mapStateToProps = (state: TopHap.StoreState) => ({
  filter: state.compare.preferences.filter,
  viewportWidth: state.ui.viewport.width
})

const mapDispatchToProps = {}

export default connect(mapStateToProps, mapDispatchToProps)(Header)
