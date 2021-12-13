import { createActions } from 'reduxsauce'

const { Types, Creators } = createActions(
  {
    setState: ['option', 'value', 'update'],
    addComparable: ['place'],
    addComparables: ['ids'],
    setComparables: ['ids'],
    updateComparables: null,
    removeComparable: ['comparable']
  },
  {
    prefix: 'compare/'
  }
)

export { Types, Creators }
