import * as _ from './path'

// https://github.com/lodash/lodash/blob/master/test/toPath.js
describe('toPath', () => {
  it('should convert a string to a path', (): void => {
    expect(_.toPath('a.b.c')).toEqual(['a', 'b', 'c'])
    expect(_.toPath('a[0].b.c')).toEqual(['a', '0', 'b', 'c'])
  })
})

test('mutatePath', (): void => {
  const obj = {}
  _.mutatePath(obj, 'a[2].b')(0)
  expect(obj).toEqual({ a: [undefined, undefined, { b: 0 }] })
  _.mutatePath(obj, 'a[0]')(1)
  expect(obj).toEqual({ a: [1, undefined, { b: 0 }] })
})
