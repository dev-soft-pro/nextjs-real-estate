import { createActions } from 'reduxsauce'

const { Types, Creators } = createActions(
  {
    updateAsyncActionStatus: ['payload']
  },
  {
    prefix: 'global/'
  }
)

export { Types, Creators }
