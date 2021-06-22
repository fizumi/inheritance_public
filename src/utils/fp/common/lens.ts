import * as R from 'ramda'
import { strArray2record } from 'src/utils/fp/common'

export const createPropLensDict = <S>(
  keys: ReadonlyArray<keyof S>
): { [K in keyof S]: R.Lens<S, S[K]> } =>
  strArray2record((key) => R.lensProp<S>(key as any))(keys as any) as any

export const createSelectorDict = <X, Y, Key extends keyof Y>(
  keys: ReadonlyArray<Key>,
  selector: (x: X) => Y
): { [K in Key]: (x: X) => Y[K] } =>
  strArray2record((key) => (x: X) => R.prop(key, selector(x)))(keys as any) as any
