import { connect } from 'react-redux'
import Header from './Header'

const mapStateToProps = (state: TopHap.StoreState) => ({
  customerOptions: state.global.customerOptions,
  isMobile: state.global.isMobile.any,
  user: state.user.info,
  viewportWidth: state.ui.viewport.width
})

const mapDispatchToProps = {}

export default connect(mapStateToProps, mapDispatchToProps)(Header)
