// import { calcInheritance as calcInharitance_DEV_ } from '../../logic/calc_inheritance'
// import { getCalcInheritanceResult } from '../graphql'
// import { useCalcInheritanceMutation } from 'src/graphql/generated/graphql'
// import { __DEV__ } from 'src/utils/common'
import { Store } from '../../model'

// back-end の実装は private にしています。
export function useCalcInheritance(): (persons: Store) => Promise<Store> {
  // const [, calcInharitance_] = useCalcInheritanceMutation()

  const calcInharitance = (persons: Store) => Promise.resolve(persons)
  // const calcInharitance = __DEV__
  //   ? (persons: Row[]) => Promise.resolve(calcInharitance_DEV_(persons))
  //   : (persons: Row[]) => calcInharitance_({ persons }).then(getCalcInheritanceResult)
  return calcInharitance
}
