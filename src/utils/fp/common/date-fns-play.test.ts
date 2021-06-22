import { formatWithOptions } from 'date-fns/fp'
import ja from 'date-fns/locale/ja'

const format = formatWithOptions({ locale: ja })
const now = new Date(2020, 11, 22)

test('yo', (): void => {
  expect(format('yo', now)).toBe('2020年')
})
test('yyyy', (): void => {
  expect(format('yyyy', now)).toBe('2020')
})
test('Yo', (): void => {
  expect(format('Yo', now)).toBe('2020年')
})
test('YYYYY', (): void => {
  expect(format('YYYYY', now)).toBe('02020')
})
test('RRRR', (): void => {
  expect(format('RRRR', now)).toBe('2020')
})
test('uuuu', (): void => {
  expect(format('uuuu', now)).toBe('2020')
})
test('PPP', (): void => {
  expect(format('PPP', now)).toBe('2020年12月22日')
}) // https://github.com/date-fns/date-fns/blob/master/src/locale/ja/snapshot.md
test('yyyy年', (): void => {
  expect(format('yyyy年', now)).toBe('2020年')
})
