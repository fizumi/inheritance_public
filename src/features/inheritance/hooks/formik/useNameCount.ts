import { function as F, readonlyRecord as RR, number } from 'fp-ts'
import { useColumn } from './formik'

export const useNameCount = () => {
  return F.pipe(
    useColumn('name'),
    RR.foldMap(number.MonoidSum)((name) => (name ? 1 : 0))
    // RR.reduce(0, (acc, name) => (name ? acc + 1 : acc))
  )
}
