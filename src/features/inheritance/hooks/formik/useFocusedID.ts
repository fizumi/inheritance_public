import { function as F } from 'fp-ts'
import * as R from 'ramda'
import { AllFieldKeys, COLS, ID } from 'src/features/inheritance/model'
import { useFocusedPath } from './formik'

export const useFocusedID = (field: AllFieldKeys): ID | null => {
  const path = useFocusedPath()
  if (path === undefined) return null

  const pathRegExp = new RegExp(`^${COLS}\\.${field}\\.(\\w+)$`)
  return F.pipe(path, R.match(pathRegExp), R.nth(1), R.defaultTo(null))
}
