import * as _ from './array-record'

const arrayRecord = { a: [1, 2], b: [3, 4] }
const recordArray = [
  { a: 1, b: 3 },
  { a: 2, b: 4 },
]

test('arrayRecordToRecordArray', (): void => {
  expect(_.arrayRecordToRecordArray()(arrayRecord)).toEqual(recordArray)
})

test('recordArrayToArrayRecord', (): void => {
  expect(_.recordArrayToArrayRecord(recordArray)).toEqual(arrayRecord)
})
