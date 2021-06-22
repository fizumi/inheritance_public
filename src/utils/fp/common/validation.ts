import * as R from 'ramda'
import { array as A, either as E, function as F, nonEmptyArray as NEA } from 'fp-ts'
import { SingleOrArray, toArray } from 'src/utils/common'

export type ErrorMessageOrVoid = string | void
export type MessageEmitterWithOptions<X = any> = (x: X, options?: any) => ErrorMessageOrVoid
type PredWithOptions<X = any> = (x: X, options?: any) => boolean

export const validationApplicative = E.getApplicativeValidation(NEA.getSemigroup<string>())

export const checkIf = <X>(
  cond: PredWithOptions<X>,
  messageIfFalse: string,
  options?: { skipWhen?: PredWithOptions<X> }
): MessageEmitterWithOptions<X> => {
  return (x, y) => {
    if (options?.skipWhen?.(x)) return
    if (cond(x, y)) {
      return
    } else {
      return messageIfFalse
    }
  }
}

export const combineMessageEmitters: <X>(
  p: SingleOrArray<MessageEmitterWithOptions<X>>
) => MessageEmitterWithOptions<X> = (p) => (x, options) =>
  F.pipe(
    toArray(p),
    A.reduce('', (acc, me) => {
      const conjunction = acc.length === 0 ? '' : 'また、'
      const withConjunction = (a: ErrorMessageOrVoid) => (a ? conjunction + a : '')
      return acc + withConjunction(me(x, options))
    }),
    R.when(R.isEmpty, F.constVoid)
  )
