import { connect } from 'react-redux'
import SearchBar from './SearchBar'
import { Creators } from 'store/actions/preferences'
import { initialState } from 'store/reducers/preferences'

const mapStateToProps = (state: TopHap.StoreState) => ({
  asyncStatus: state.global.status,
  keyword: state.preferences.keyword,
  place: state.preferences.place,
  filter: state.preferences.filter,
  viewportWidth: state.ui.viewport.width
})

const mapDispatchToProps = {
  setFilterOption: Creators.setFilterOption,
  resetFilters: () => Creators.setOption('filter', initialState.filter),
  updateKeyword: Creators.updateKeyword,
  updatePlace: Creators.updatePlace
}

export default connect(mapStateToProps, mapDispatchToProps)(SearchBar)
