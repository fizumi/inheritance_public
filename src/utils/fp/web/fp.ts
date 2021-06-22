import * as R from 'ramda'
import { function as F, option as O, readonlyRecord as RR } from 'fp-ts'

export const getNumberFrom: (unit: 'px' | 'em') => (str: string) => O.Option<number> = (unit) =>
  F.flow(
    R.match(new RegExp(`(\\d+\\.?\\d*)${unit}`)), // (\d+\.?\d*)px
    R.nth(1),
    O.fromNullable as (a: string | undefined) => O.Option<string>,
    O.map(parseFloat)
  )

export const sefeGetNumberFrom: (
  unit: 'px' | 'em'
) => (maybeStr: string | undefined) => number | undefined = (unit) => (maybeStr) =>
  F.pipe(
    O.fromNullable(maybeStr),
    O.chain(getNumberFrom(unit)),
    O.getOrElseW(() => undefined)
  )

const pickNumberHeightWidth: (el: CSSStyleDeclaration) => O.Option<HeightWidth> = F.flow(
  R.pick(['height', 'width']),
  RR.traverse(O.Applicative)(getNumberFrom('px'))
)

export type HeightWidth = Record<'height' | 'width', number>
export const getHeightAndWidth = (window: Window): ((elt: Element) => O.Option<HeightWidth>) =>
  F.flow(window.getComputedStyle, pickNumberHeightWidth)

// https://stackoverflow.com/a/4572014
export const getEmSize =
  (window: Window) =>
  (element: Element): O.Option<number> =>
    F.pipe(window.getComputedStyle(element).fontSize, getNumberFrom('px'))

export const getRemSize = (window: Window | undefined): number | undefined =>
  F.pipe(
    window?.getComputedStyle(window.document.documentElement).fontSize,
    O.fromNullable,
    O.chain(getNumberFrom('px')),
    O.getOrElseW(() => undefined)
  )
