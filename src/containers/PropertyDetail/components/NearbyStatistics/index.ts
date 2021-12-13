import { connect } from 'react-redux'
import NearbyStatistics from './NearbyStatistics'
import { Creators } from 'store/actions/properties'

const mapStateToProps = (state: TopHap.StoreState) => ({
  asyncStatus: state.global.status,
  neighborhood: state.properties.neighborhood
})

const mapDispatchToProps = {
  getNeighborhood: Creators.getNeighborhood
}

export default connect(mapStateToProps, mapDispatchToProps)(NearbyStatistics)
