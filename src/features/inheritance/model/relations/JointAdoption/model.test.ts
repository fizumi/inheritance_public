import * as _ from './model'

const data = {
  'D-E->A': { type: '共同縁組', startDate: '2021', endDate: null },
}

test('startDate', (): void => {
  expect(
    _.getDatePropOfLatestJARelOrRel('startDate', 'D', 'A', { startDate: '2022', endDate: '2022' })(
      data
    )
  ).toBe('2021')
  expect(
    _.getDatePropOfLatestJARelOrRel('startDate', 'F', 'A', { startDate: '2022', endDate: '2022' })(
      data
    )
  ).toBe('2022')
})
