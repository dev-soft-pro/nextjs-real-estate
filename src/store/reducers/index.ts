import { combineReducers } from 'redux'
import global from './global'
import ui from './ui'
import user from './user'
import preferences from './preferences'
import properties from './properties'
import compare from './compare'

export default combineReducers({
  global,
  ui,
  user,
  preferences,
  properties,
  compare
})
