// https://gcanti.github.io/fp-ts/modules/
import { option as O, either as E, function as F, readonlyRecord as _RR } from 'fp-ts'
import * as R from 'ramda'

export const isOption = <A>(x: unknown): x is O.Option<A> => {
  const _tag = x
  return _tag === undefined ? false : _tag === 'Some' || _tag === 'None'
}

// 型情報を予め決定できる。
export const nullable =
  <A>() =>
  (a?: A | null): O.Option<NonNullable<A>> =>
    O.fromNullable(a)

export const OtoBoolean = O.foldW(R.F, R.T)
export const EtoBoolean = E.foldW(R.F, R.T)

export const _remove_me_v3 = F.identity as () => any

// v3
export const has = Object.prototype.hasOwnProperty
export const v3 = {
  RR: {
    insertAt:
      <A>(k: string, a: A) =>
      (r: _RR.ReadonlyRecord<string, A>): O.Option<_RR.ReadonlyRecord<string, A>> => {
        if (!has.call(r, k)) {
          const out: Record<string, A> = Object.assign({}, r)
          out[k] = a
          return O.some(out)
        }
        return O.none
      },
  },
}
