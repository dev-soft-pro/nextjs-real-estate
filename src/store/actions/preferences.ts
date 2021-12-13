import { createActions } from 'reduxsauce'

const { Types, Creators } = createActions(
  {
    addDrawing: ['feature'],
    updateDrawing: ['feature'],
    removeDrawing: ['feature'],
    setFilterOption: ['option', 'value', 'update'],
    setMapOption: ['option', 'value', 'update'],
    setOption: ['option', 'value', 'update'],
    updateKeyword: ['keyword'],
    updatePlace: ['place'],
    updateStates: ['payload']
  },
  {
    prefix: 'preferences/'
  }
)

export { Types, Creators }
