import { semigroup as SG } from 'fp-ts'
import * as R from 'ramda'
import React from 'react'

/*
    types
*/
export const clientXY = ['clientX', 'clientY'] as const
export const NOT_MOVE = { clientX: 0, clientY: 0 }
export type MouseEvents = React.MouseEvent<Element, MouseEvent> | MouseEvent
export type ClientXY = Pick<MouseEvent, typeof clientXY[number]>

/*
    pure functions
*/
export const pickClientXY = (e: MouseEvents): ClientXY => R.pick(clientXY, e)
const semigroupSubtract: SG.Semigroup<number> = {
  concat: (a, b) => a - b,
}
const semigroupClientXYSubtract: SG.Semigroup<ClientXY> = SG.struct({
  clientX: semigroupSubtract,
  clientY: semigroupSubtract,
})
export const clientXYSubtract: (x: ClientXY, y: ClientXY) => ClientXY =
  semigroupClientXYSubtract.concat
