import { createSelector } from '../../../createSelector'
import { path } from './constant'
import { field2selector as pseudoSpouses } from './pseudoSpouses'

export default createSelector(path)

export const colsSelector = {
  ...pseudoSpouses,
}
