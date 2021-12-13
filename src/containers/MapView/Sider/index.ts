import { connect } from 'react-redux'
import Sider from './Sider'
import { Creators } from 'store/actions/ui'

const mapStateToProps = (state: TopHap.StoreState) => ({
  mode: state.ui.siderMode,
  sider: state.ui.sider,
  viewportWidth: state.ui.viewport.width
})

const mapDispatchToProps = {
  updateSider: Creators.updateSider
}

export default connect(mapStateToProps, mapDispatchToProps)(Sider)
