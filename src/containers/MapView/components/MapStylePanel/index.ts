import { connect } from 'react-redux'
import MapStylePanel from './MapStylePanel'
import { Creators } from 'store/actions/preferences'

const mapStateToProps = () => ({})

const mapDispatchToProps = {
  setMapOption: Creators.setMapOption
}

export default connect(mapStateToProps, mapDispatchToProps)(MapStylePanel)
