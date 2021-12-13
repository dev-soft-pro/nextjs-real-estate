import { connect } from 'react-redux'
import SideMenu from './SideMenu'
import { Creators } from 'store/actions/ui'

const mapStateToProps = (state: TopHap.StoreState) => ({
  expanded: state.ui.isSideMenuExpanded,
  properties: state.preferences.map.properties,
  rental: state.preferences.filter.rental,
  sider: state.ui.sider,
  siderMode: state.ui.siderMode,
  user: state.user.info,
  viewportWidth: state.ui.viewport.width
})

const mapDispatchToProps = {
  updateUI: Creators.updateStates
}

export default connect(mapStateToProps, mapDispatchToProps)(SideMenu)
