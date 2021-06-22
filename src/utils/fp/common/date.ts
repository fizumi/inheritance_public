import * as R from 'ramda'
import { function as F, readonlyArray as A } from 'fp-ts'

// const dateTimeFormat = new Intl.DateTimeFormat('ja-JP-u-ca-japanese', { era: 'long' })
export const getGENGOU = F.flow(R.match(new RegExp(`\\W{2}\\d+`)), A.head)
