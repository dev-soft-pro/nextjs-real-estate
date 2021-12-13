import { connect } from 'react-redux'
import AnalyticsLayerPanel from './AnalyticsLayerPanel'
import { Creators } from 'store/actions/preferences'

const mapStateToProps = (state: TopHap.StoreState) => ({
  descriptive: state.preferences.map.descriptive
})

const mapDispatchToProps = {
  setMapOption: Creators.setMapOption
}

export default connect(mapStateToProps, mapDispatchToProps)(AnalyticsLayerPanel)
