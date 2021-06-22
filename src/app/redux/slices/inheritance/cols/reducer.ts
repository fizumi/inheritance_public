import { combineReducers } from '@reduxjs/toolkit'
import pseudoSpouses from './pseudoSpouses'
import { field } from './constant'

export default {
  [field]: combineReducers({
    ...pseudoSpouses,
  }),
}
