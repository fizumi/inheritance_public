import { combineReducers } from '@reduxjs/toolkit'
import { persistReducer } from 'redux-persist'
import { persist } from './libs/redux-persist'
import inheritance from './slices/inheritance/reducer'
import settings from './slices/settings'

const rootReducer = combineReducers({ ...inheritance, ...settings })
const reducer = persistReducer(persist.config, rootReducer)
export default reducer
