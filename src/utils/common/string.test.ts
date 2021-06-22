import * as _ from './string'

test('removeAt', (): void => {
  expect(_.removeAt(-1)('123')).toBe('123')
  expect(_.removeAt(0)('123')).toBe('23')
  expect(_.removeAt(2)('123')).toBe('12')
  expect(_.removeAt(3)('123')).toBe('123')
})

test('removeA', (): void => {
  expect(_.removeA('/')('1/23')).toBe('123')
  expect(_.removeA('/')('123')).toBe('123')
})

test('removeLastChar', (): void => {
  expect(_.removeLastChar('123')).toBe('12')
  expect(_.removeLastChar('')).toBe('')
})

test('firstAccepttedCharIndex', (): void => {
  const getFirstXIndexStartFrom = _.firstAccepttedCharIndex((x: string) => x === 'x')
  expect(getFirstXIndexStartFrom(0)('x123')).toBe(0)
  expect(getFirstXIndexStartFrom(0)('1x23')).toBe(1)
  expect(getFirstXIndexStartFrom(0)('12x3')).toBe(2)
  expect(getFirstXIndexStartFrom(1)('x123')).toBe(-1)
  expect(getFirstXIndexStartFrom(1)('1x23')).toBe(1)
  expect(getFirstXIndexStartFrom(3)('123x')).toBe(3)
  expect(getFirstXIndexStartFrom(4)('123x')).toBe(-1)
  expect(getFirstXIndexStartFrom(5)('123x')).toBe(-1)
  expect(getFirstXIndexStartFrom(-1)('123x')).toBe(-1)
})

test('insertChar', (): void => {
  expect(_.insertChar('123', 'x', -1)).toBe('123')
  expect(_.insertChar('123', 'x', 0)).toBe('x123')
  expect(_.insertChar('123', 'x', 1)).toBe('1x23')
  expect(_.insertChar('123', 'x', 2)).toBe('12x3')
  expect(_.insertChar('123', 'x', 3)).toBe('123x')
  expect(_.insertChar('123', 'x', 4)).toBe('123')
})

test('pickLast', (): void => {
  expect(_.getLastChar('123')).toBe('3')
  expect(_.getLastChar('')).toBe('')
})

test('getDiffString', (): void => {
  expect(_.getDiffString('123', 'x123')).toBe('x')
  expect(_.getDiffString('123', '1x23')).toBe('x')
  expect(_.getDiffString('123', '123x')).toBe('x')
  expect(_.getDiffString('123', 'xx123')).toBe('xx')
  expect(_.getDiffString('123', '1xx23')).toBe('xx')
  expect(_.getDiffString('123', '123xx')).toBe('xx')
  expect(_.getDiffString('123', '1x2x3')).toBe('xx')
  expect(_.getDiffString('123', 'x1x2x3x')).toBe('xxxx')
  expect(_.getDiffString('123', '23')).toBe(null)
})
