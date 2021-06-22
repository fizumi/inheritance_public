import * as _ from './idMap'

describe('UniqueRecords and IDArrayAndIDMapRecord', () => {
  const recordsWithId = [
    { id: 'a', num: 1, upper: 'A' },
    { id: 'b', num: 2, upper: 'B' },
    { id: 'c', num: 3, upper: 'C' },
  ]

  const idArrayAndidRecordRecord = {
    id: ['a', 'b', 'c'],
    num: { a: 1, b: 2, c: 3 },
    upper: { a: 'A', b: 'B', c: 'C' },
  }

  test('uniqueRecords2IDArrayAndIDMapRecord', (): void => {
    let dst: any = _.uniqueRecords2IDArrayAndIDMapRecord()(recordsWithId)
    expect(dst).toEqual(idArrayAndidRecordRecord)
    dst = _.uniqueRecords2IDArrayAndIDMapRecord('upper')(recordsWithId)
    expect(dst).toEqual({
      upper: ['A', 'B', 'C'],
      num: { A: 1, B: 2, C: 3 },
      id: { A: 'a', B: 'b', C: 'c' },
    })
  })

  test('idArrayAndIDMapRecord2uniqueRecords', () => {
    const dst = _.idArrayAndIDMapRecord2uniqueRecords()<'num' | 'upper'>(idArrayAndidRecordRecord)
    expect(dst).toEqual(recordsWithId)
  })

  test('append', () => {
    const dst: any = _.append()({ id: 'd', num: 4, upper: 'D' })(idArrayAndidRecordRecord)
    expect(dst).toEqual({
      id: ['a', 'b', 'c', 'd'],
      num: { a: 1, b: 2, c: 3, d: 4 },
      upper: { a: 'A', b: 'B', c: 'C', d: 'D' },
    })
  })
  test('remove', () => {
    const dst: any = _.remove()('b')(idArrayAndidRecordRecord)
    expect(dst).toEqual({
      id: ['a', 'c'],
      num: { a: 1, c: 3 },
      upper: { a: 'A', c: 'C' },
    })
  })
  test('initializeField', () => {
    const initializeAllField: any = _.initializeField()({
      num: 0,
      upper: '',
    })(idArrayAndidRecordRecord)
    expect(initializeAllField).toEqual({
      id: ['a', 'b', 'c'],
      num: { a: 0, b: 0, c: 0 },
      upper: { a: '', b: '', c: '' },
    })
    const initializeOneField: any = _.initializeField()({ num: 0 })(idArrayAndidRecordRecord)
    expect(initializeOneField).toEqual({
      id: ['a', 'b', 'c'],
      num: { a: 0, b: 0, c: 0 },
      upper: { a: 'A', b: 'B', c: 'C' },
    })
  })
})

test.only('idMapOfRecord2recordArray', (): void => {
  const idMap = {
    A: { a: 1 },
    B: { b: 2 },
  }
  expect(_.idMapOfRecord2recordArray()(idMap)).toEqual([
    { id: 'A', a: 1 },
    { id: 'B', b: 2 },
  ])
  expect(_.idMapOfRecord2recordArray('key')(idMap)).toEqual([
    { key: 'A', a: 1 },
    { key: 'B', b: 2 },
  ])
  expect(_.idMapOfRecord2recordArray()({})).toEqual([])
})
