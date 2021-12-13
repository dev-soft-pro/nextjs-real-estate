import { connect } from 'react-redux'
import MapView from './MapView'
import { Creators } from 'store/actions/ui'

const mapStateToProps = (state: TopHap.StoreState) => ({
  isSiderVisible: state.ui.sider.visible,
  viewportWidth: state.ui.viewport.width
})

const mapDispatchToProps = {
  updateSider: Creators.updateSider
}

export default connect(mapStateToProps, mapDispatchToProps)(MapView)
