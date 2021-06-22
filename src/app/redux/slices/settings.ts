import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { createSelectorDict } from 'src/utils/fp/common/lens'
import { createSelector } from '../createSelector'
import { toDict } from 'src/utils/types'
import * as R from 'ramda'

// constant / type
const dateDisplayTypeArray = ['和暦', '西暦'] as const
export type DateDisplayType = typeof dateDisplayTypeArray[number]
export const dateDisplayTypeDict = R.zipObj(dateDisplayTypeArray, dateDisplayTypeArray) as {
  [K in DateDisplayType]: K
}

export const field = 'settings'
const fields = ['dateDisplayType', 'settingsDrawerOpen'] as const
const d = toDict(fields)
export const path = [field] as const

// slice
export const slice = createSlice({
  name: R.join('/', path),
  initialState: {
    [d.dateDisplayType]: dateDisplayTypeDict.和暦 as DateDisplayType,
    [d.settingsDrawerOpen]: false,
  },
  reducers: {
    setDateDisplayType: (state, action: PayloadAction<DateDisplayType>) => {
      state.dateDisplayType = action.payload
    },
  },
})

// action
export const { setDateDisplayType } = slice.actions

// selector
export const selector = createSelector(path)
export const selectors = createSelectorDict(fields, selector)

// reducer
export default { [field]: slice.reducer }
