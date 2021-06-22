import { pipe } from 'fp-ts/lib/function'
import { add, format, fraction } from 'mathjs'
import * as R from 'ramda'
import { Store } from '../../model'
import * as lens from '../../model/lens'
import { ID } from '../../shared/types'
import { AnyObject, Heirs, KeysOf } from './types'

/*
    basic
*/

export const setShare = (s: Store, [id, share]: [ID, string]): Store => {
  const portionLens = lens.portionOfInheritance(id)
  return pipe(
    format(add(fraction(R.view(portionLens, s) || '0'), fraction(share))),
    R.set(portionLens),
    R.applyTo(s)
  )
}

/*
    Herirs
*/
export const has = (prop: string): ((obj: AnyObject) => boolean) => R.has(prop)
export const allHas = (props: Array<KeysOf<Heirs>>): ((heirs: Heirs) => boolean) =>
  R.allPass(props.map(has))
export const anyHas = (props: Array<KeysOf<Heirs>>): ((heirs: Heirs) => boolean) =>
  R.anyPass<Heirs>(props.map(has))
