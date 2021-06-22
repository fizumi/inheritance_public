import { function as F, option as O } from 'fp-ts'
import * as R from 'ramda'
import { nilHole } from 'src/utils/fp/common'

export const getGridTemplateColumns = F.flow(
  R.match(/grid-template-columns:\s*(.*?)\s*;/),
  R.nth(1)
)

const removeSpaceAfterComma = R.replace(/,\s+/g, ',')

export const gridTemplateColumns2array = F.flow(removeSpaceAfterComma, R.split(/\s+/))

export const getGridTemplateColumnsArray = F.flow(getGridTemplateColumns, (x) =>
  x ? gridTemplateColumns2array(x) : []
)

export const unsafeGetGridTemplateColumnsArray = F.flow(
  getGridTemplateColumns,
  nilHole,
  gridTemplateColumns2array
)

export const unsafeGetGridTemplateColumnsCount = F.flow(unsafeGetGridTemplateColumnsArray, R.length)
