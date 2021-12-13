import Statistics from './Statistics'
import { connect } from 'react-redux'
import { Creators } from 'store/actions/properties'

const mapStateToProps = (state: TopHap.StoreState) => ({
  asyncStatus: state.global.status,
  bounds: state.preferences.map.viewport.bounds,
  drawings: state.preferences.drawings,
  isSiderVisible: state.ui.sider.visible,
  neighborhood: state.properties.neighborhood,
  neighborhoodDom: state.properties.neighborhoodDom,
  place: state.preferences.place,
  siderMode: state.ui.siderMode
})

const mapDispatchToProps = {
  getNeighborhood: Creators.getNeighborhood,
  getNeighborhoodDom: Creators.getNeighborhoodDom
}

export default connect(mapStateToProps, mapDispatchToProps)(Statistics)
