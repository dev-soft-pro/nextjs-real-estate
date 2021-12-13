import { connect } from 'react-redux'
import HelpMenu from './HelpMenu'
import { Creators } from 'store/actions/ui'

const mapStateToProps = (state: TopHap.StoreState) => ({
  isMobile: state.global.isMobile.any
})

const mapDispatchToProps = {
  showFeedback: Creators.showFeedback
}

export default connect(mapStateToProps, mapDispatchToProps)(HelpMenu)
