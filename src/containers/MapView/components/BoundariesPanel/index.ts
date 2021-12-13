import { connect } from 'react-redux'
import BoundariesPanel from './BoundariesPanel'
import { Creators } from 'store/actions/preferences'

const mapStateToProps = (state: TopHap.StoreState) => ({
  authenticated: state.user.isAnonymous === false,
  zones: state.preferences.map.zones
})

const mapDispatchToProps = {
  setMapOption: Creators.setMapOption
}

export default connect(mapStateToProps, mapDispatchToProps)(BoundariesPanel)
