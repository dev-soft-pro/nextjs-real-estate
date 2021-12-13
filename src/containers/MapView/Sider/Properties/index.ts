import { connect } from 'react-redux'
import Properties from './Properties'
import { BREAK_SM } from 'consts'
import { Creators as PreferencesCreators } from 'store/actions/preferences'
import { Creators } from 'store/actions/properties'
import { Creators as UICreators } from 'store/actions/ui'

const mapStateToProps = (state: TopHap.StoreState) => ({
  asyncStatus: state.global.status,
  isMobile: state.global.isMobile.any,
  isWindowScroll: state.ui.viewport.width <= BREAK_SM,
  mls: state.properties.mls,
  mode: state.ui.sider.properties,
  properties: state.properties.list,
  rentalEstimate: state.preferences.filter.rental,
  siderSize: state.ui.sider.size
})

const mapDispatchToProps = {
  getProperties: Creators.getProperties,
  setHovered: (hovered?: TopHap.Property) => Creators.updateStates({ hovered }),
  setMapOption: PreferencesCreators.setMapOption,
  updateMode: (payload: any) =>
    UICreators.updateSider('properties', payload, true)
}

export default connect(mapStateToProps, mapDispatchToProps)(Properties)
