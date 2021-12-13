import { connect } from 'react-redux'
import AppHeader from './AppHeader'
import { Creators } from 'store/actions/ui'

const mapStateToProps = (state: TopHap.StoreState) => ({
  customerOptions: state.global.customerOptions,
  isSideMenuExpanded: state.ui.isSideMenuExpanded,
  user: state.user.info
})

const mapDispatchToProps = {
  updateUI: Creators.updateStates,
  updateSider: Creators.updateSider
}

export default connect(mapStateToProps, mapDispatchToProps)(AppHeader)
