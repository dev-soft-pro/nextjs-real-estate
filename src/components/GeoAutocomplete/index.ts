import { connect } from 'react-redux'
import GeoAutocomplete from './GeoAutocomplete'
import { Creators } from 'store/actions/user'
import { Creators as UICreators } from 'store/actions/ui'

const mapStateToProps = (state: TopHap.StoreState) => ({
  recent: state.user.recent
})

const mapDispatchToProps = {
  getRecentSearches: Creators.getRecentSearches,
  addRecentSearch: Creators.addRecentSearch,
  updateMode: (payload: any) =>
    UICreators.updateSider('properties', payload, true)
}

export default connect(mapStateToProps, mapDispatchToProps)(GeoAutocomplete)
