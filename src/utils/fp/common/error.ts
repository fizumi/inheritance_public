import * as R from 'ramda'
import { function as F } from 'fp-ts'

export const error = R.construct(Error)

const renameTo =
  <Name extends string>(n: Name) =>
  (e: Error) => {
    e.name = n
    return e as unknown as Error & { name: Name }
  }

const makeCustomErrorConstructor = <Name extends string>(n: Name) => F.flow(error, renameTo(n))

export const dataError = makeCustomErrorConstructor('DataError')

export const logicError = makeCustomErrorConstructor('LogicError')
