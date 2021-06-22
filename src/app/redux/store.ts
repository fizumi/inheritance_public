import 'react-redux'
import { configureStore } from '@reduxjs/toolkit'
import { Dispatch, Action } from 'redux'
import reducer from './reducer'
import middleware from './middleware'

export const store = configureStore({
  reducer,
  middleware,
})

export type RootState = ReturnType<typeof store.getState>

declare module 'react-redux' {
  // eslint-disable-next-line @typescript-eslint/no-empty-interface
  interface DefaultRootState extends RootState {}
  export function useDispatch<TDispatch = Dispatch<Action>>(): TDispatch
  export function useStore(): RootState
}
