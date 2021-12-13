import { createActions } from 'reduxsauce'

const { Types, Creators } = createActions(
  {
    updateSider: ['field', 'payload', 'update'],
    updateStates: ['payload'],
    updateViewport: ['viewport'],
    showFeedback: ['visible']
  },
  {
    prefix: 'ui/'
  }
)

export { Types, Creators }
