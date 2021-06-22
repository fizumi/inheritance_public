import * as _ from './date'
import { option as O } from 'fp-ts'

test('getGENGOU', (): void => {
  expect(_.getGENGOU('令和3年1月1日')).toEqual(O.some('令和3'))
  expect(_.getGENGOU('平成3年10月6日')).toEqual(O.some('平成3'))
  expect(_.getGENGOU('大正3年1月1日')).toEqual(O.some('大正3'))
  expect(_.getGENGOU('昭和3年1月1日')).toEqual(O.some('昭和3'))
  expect(_.getGENGOU('令和1/1/1')).toEqual(O.some('令和1'))
})
