import { persist } from './libs/redux-persist'
import { getDefaultMiddleware } from '@reduxjs/toolkit'

const middleware = getDefaultMiddleware({
  serializableCheck: {
    ignoredActions: persist.actions, // https://redux-toolkit.js.org/usage/usage-guide#use-with-redux-persist
  },
})
export default middleware
