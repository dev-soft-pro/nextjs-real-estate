import { connect } from 'react-redux'
import LegendOptionsPanel from './LegendOptionsPanel'
import { Creators } from 'store/actions/preferences'

const mapStateToProps = (state: TopHap.StoreState) => ({
  descriptive: state.preferences.map.descriptive,
  properties: state.preferences.map.properties,
  timeline: state.preferences.map.timeline
})

const mapDispatchToProps = {
  setMapOption: Creators.setMapOption,
  setFilterOption: Creators.setFilterOption
}

export default connect(mapStateToProps, mapDispatchToProps)(LegendOptionsPanel)
