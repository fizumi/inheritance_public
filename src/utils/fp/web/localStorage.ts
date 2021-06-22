import { either as E, function as F } from 'fp-ts'
import * as J from 'fp-ts/Json'
import { getItem } from 'fp-ts-local-storage' // https://github.com/gcanti/fp-ts-local-storage/blob/e7842a49b0ccb8784089f7ed8f6a9c9bb2a8f8ac/src/index.ts
import { _remove_me_v3 } from 'src/utils/fp/common'

const toError = (msg: string) => (e?: unknown) => {
  return e instanceof Error ? e : new Error(msg)
}

export const getLocalStorageJson = (key: string): E.Either<Error, J.Json> =>
  F.pipe(
    E.tryCatch(getItem(key), _remove_me_v3),
    E.mapLeft(toError('get error')),
    E.chain(E.fromOption(toError('empty'))),
    E.chain(J.parse),
    E.mapLeft(toError('parse error'))
  )

export type Validator<E, V> = (x: J.Json) => E.Either<E | Error, V>
export const getLocalStorageValue = <V, E>(
  key: string,
  validator: Validator<E, V>
): E.Either<E | Error, V> => F.pipe(getLocalStorageJson(key), E.chain(validator))
