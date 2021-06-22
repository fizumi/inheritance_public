// import React from 'react'
import tb from 'ts-toolbelt'
import * as R from 'ramda'
import { function as F } from 'fp-ts'
import { useSequenceMemo } from 'src/utils/react/hooks'
import {
  idArrayAndIDMapRecord2uniqueRecords,
  getRecordBy as getRecordBy,
  memoizeCurriedFn,
} from 'src/utils/fp/common'
import { useColumn } from './formik'

import { IDMap, Row, WebCol } from 'src/features/inheritance/model'

export const status2letter = {
  故人: '亡',
  被相続人: '被',
  相続人: '相',
} as const
export type StatusLetter = tb.O.UnionOf<typeof status2letter>
export const letter2status = R.invertObj(status2letter) as tb.O.Invert<typeof status2letter>

export const getInitialStatuses = (
  materialsOfStatus: Pick<WebCol, 'id' | 'isAlive' | 'deathDate'>
): IDMap<StatusLetter> => {
  const records = idArrayAndIDMapRecord2uniqueRecords()<'isAlive' | 'deathDate'>(materialsOfStatus)
  const statuses = records.reduce((acc: IDMap<StatusLetter>, r) => {
    const { id, ...other } = r
    return R.assoc(id, getStatus(other), acc)
  }, {} as IDMap<StatusLetter>)

  return statuses
}

const keysOfStatusMaterials = ['deathDate', 'isAlive'] as const
export type KeysOfStatusMaterials = typeof keysOfStatusMaterials[number]
export type StatusMaterials = Pick<Row, KeysOfStatusMaterials>
export type StatusesMaterials = Pick<WebCol, KeysOfStatusMaterials>

export const getStatus = (statusMaterials: StatusMaterials) => {
  const { isAlive, deathDate } = statusMaterials
  return !isAlive
    ? status2letter.故人
    : !deathDate // 死亡日が入力されていない
    ? status2letter.相続人
    : status2letter.被相続人
}
export const getStatuses = memoizeCurriedFn((statusesMaterials: StatusesMaterials) => {
  const ids = R.keys(statusesMaterials.isAlive)
  const statuses = ids.reduce(
    (acc, id) => F.pipe(statusesMaterials, getRecordBy(id), getStatus, R.assoc(id, R.__, acc)),
    {} as IDMap<StatusLetter>
  )
  return statuses
})

// useSequenceMemo は reselect の役割を果たす
export const useStatus = () => {
  const statusesMaterials = useSequenceMemo({
    deathDate: useColumn('deathDate'),
    isAlive: useColumn('isAlive'),
  })
  const status = getStatuses(statusesMaterials)

  return [status, statusesMaterials] as const
}
// status の様な 「基本的な状態」 から計算した「中間的状態」を計算したい場合は、上記のように
// memoization を用いて、無駄な計算を削除するのが、ベストか。
// かつては、 status に対して, useState を用いていたが、余計なレンダリングを生じさせ、プログラムを複雑にしてしまっていた。
