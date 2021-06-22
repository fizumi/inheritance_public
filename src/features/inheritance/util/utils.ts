import { function as F, readonlyRecord as RR } from 'fp-ts'
import * as R from 'ramda'
import { timestampStr } from 'src/utils/fp/common'
import { __DEV__ } from 'src/utils/common'
import { defaultWebRow, Row, key } from 'src/features/inheritance/model'

const coreFields = [key.id, key.name] as const
export type CoreFields = Pick<Row, typeof coreFields[number]>
export const createCoreField = (name = ''): CoreFields => ({
  [key.id]: 'ID' + timestampStr(),
  [key.name]: name,
})

export const newPerson = (name = ''): Row =>
  F.pipe(defaultWebRow(), R.mergeLeft(createCoreField(name)))
// "ID" は Excel に CSV を読み込まれた時に, 文字列として解釈させるため

export const rowIsEmpty = (
  (emptyRow: Record<string, any>, defaultIsEmpty: (x: any) => boolean) =>
  (row: Record<string, any>): boolean => {
    const isEmptyEvolver = F.pipe(RR.map(R.equals)(emptyRow), R.dissoc(key.id))
    const { id: _, ...other } = row
    return F.pipe(
      other,
      R.evolve(isEmptyEvolver),
      RR.reduce(true as boolean, (acc, isEmptyOrNotEvaluated) => {
        const x = isEmptyOrNotEvaluated
        const [isEmpty, notEvaluated] = typeof x === 'boolean' ? [x] : [undefined, x]
        if (isEmpty !== undefined) {
          return acc && isEmpty
        }
        return acc && defaultIsEmpty(notEvaluated)
      })
    )
  }
)(defaultWebRow(), (somethingIDs: string[]) => R.isEmpty(somethingIDs))
