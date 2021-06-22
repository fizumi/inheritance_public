import * as _ from 'src/utils/fp/common/error'

test('test', (): void => {
  // expect(_.data('test'))
  const error = _.dataError('some error')

  expect(error instanceof Error).toBe(true)
})
