import { connect } from 'react-redux'
import Timeline from './Timeline'
import { Creators } from 'store/actions/preferences'

const mapStateToProps = (state: TopHap.StoreState) => ({
  enabled: state.preferences.map.timeline,
  descriptive: state.preferences.map.descriptive
})

const mapDispatchToProps = {
  setFilterOption: Creators.setFilterOption,
  setMapOption: Creators.setMapOption
}

export default connect(mapStateToProps, mapDispatchToProps)(Timeline)
