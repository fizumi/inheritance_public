import { combineReducers } from '@reduxjs/toolkit'
import cols from './cols/reducer'
import { field } from './constant'

export default {
  [field]: combineReducers({
    ...cols,
  }),
}
