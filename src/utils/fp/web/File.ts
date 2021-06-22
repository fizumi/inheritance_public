import React from 'react'
import * as R from 'ramda'
import { either as E, function as F, taskEither as TE } from 'fp-ts'
import * as J from 'fp-ts/Json'
import * as RA from 'ramda-adjunct'
import { _remove_me_v3 } from 'src/utils/fp/common'

export const getFile = (e: React.ChangeEvent<HTMLInputElement>): E.Either<Error, File> =>
  E.fromNullable(new Error('ご使用中のブラウザはファイルロード機能をサポートしていません'))(
    e.target.files?.[0]
  )

/**
 * 同一名ファイルを続けてアップロードできるようにする
 */
export const clearTargetValue = R.tap<React.ChangeEvent<HTMLInputElement>>(
  (e) => (e.target.value = '')
)

// https://stackoverflow.com/a/21446426
export function loadJsonFile(file: File): TE.TaskEither<unknown, J.Json> {
  return () =>
    new Promise<E.Either<unknown, J.Json>>((resolve) => {
      if (typeof window.FileReader !== 'function') {
        resolve(E.left(new Error('ご使用中のブラウザはファイル読込機能をサポートしていません')))
        return
      }
      const fr = new FileReader()
      fr.onload = F.flow(
        (e) => e.target?.result,
        E.fromPredicate(RA.isString, () => new Error('ファイルを取得出来ませんでした')),
        E.chain(J.parse),
        resolve
      )
      fr.readAsText(file)
    })
}
