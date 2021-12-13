import { connect } from 'react-redux'
import PropertyDetail from './PropertyDetail'
import { Creators } from 'store/actions/properties'
import { Creators as PreferencesCreators } from 'store/actions/preferences'
import { Creators as UserCreators } from 'store/actions/user'
import { Creators as UICreators } from 'store/actions/ui'

const mapStateToProps = (state: TopHap.StoreState) => ({
  authenticated: state.user.isAnonymous === false,
  detail: state.properties.detail,
  estimatesByRadius: state.properties.estimatesByRadius,
  isMobile: state.global.isMobile.any,
  mapStyle: state.global.customerOptions.mapStyle,
  mls: state.properties.mls,
  viewportWidth: state.ui.viewport.width
})

const mapDispatchToProps = {
  addRecentView: UserCreators.addRecentView,
  estimateByRadius: Creators.estimateByRadius,
  getMlsInfo: Creators.getMlsInfo,
  setMapOption: PreferencesCreators.setMapOption,
  updateDetail: (
    detail: Partial<TopHap.PropertiesState['detail']>,
    update?: boolean
  ) => Creators.setState('detail', detail, update),
  updateSider: UICreators.updateSider
}

export default connect(mapStateToProps, mapDispatchToProps)(PropertyDetail)
