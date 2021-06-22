import * as _ from './utils'

test('getKeyValueTupleThatHasLatestStartDate', (): void => {
  expect(
    _.getKeyValueTupleThatHasLatestStartDate([
      [null, { startDate: '2021/10/10' }],
      [null, { startDate: '2021/10/11' }],
      [null, { startDate: null }],
      [null, { startDate: '2021/10/09' }],
    ])
  ).toEqual([null, { startDate: '2021/10/11' }])
})
