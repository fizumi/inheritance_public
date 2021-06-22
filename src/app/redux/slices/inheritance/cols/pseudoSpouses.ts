import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { key } from 'src/features/inheritance/model'
import * as R from 'ramda'
import { path as parent } from './constant'
import { createSelector } from '../../../createSelector'

// constant
export const field = key.pseudoSpouses
export const path = [...parent, field] as const

// slice
export const slice = createSlice({
  name: R.join('/', path),
  initialState: { arrowBigamous: false },
  reducers: {
    setArrowBigamous: (state, { payload }: PayloadAction<boolean>) => {
      state.arrowBigamous = payload
    },
  },
})

// action
export const { setArrowBigamous } = slice.actions

// selector
export const selector = createSelector(path)
export const field2selector = { [field]: selector }

// reducer
export default { [field]: slice.reducer }
