import * as _ from './function'
import { option as O } from 'fp-ts'

test('tapWhenDebug', (): void => {
  let test: number
  expect(
    _.tapWhenDebug(() => {
      test = 0
    })(1)
  ).toBe(1)
  process.nextTick(() => expect(test).toBe(0))
})

test('isThunk', (): void => {
  expect(_.isThunk(() => null)).toBe(true)
  expect(_.isThunk((a: any) => a)).toBe(false)
  expect(_.isThunk(null)).toBe(false)
})

describe('repetitiveGet', (): void => {
  test('none', async () => {
    const constVoid = jest.fn()
    return _.repetitiveGet(constVoid, 5, 0)().then((data) => {
      expect(constVoid).toHaveBeenCalledTimes(5)
      expect(data).toEqual(O.none)
      return
    })
  })
  test('some', async () => {
    const myMock = jest.fn()
    myMock.mockReturnValueOnce(null).mockReturnValueOnce(undefined).mockReturnValueOnce('x')
    return _.repetitiveGet(myMock, 3, 0)().then((data) => {
      expect(myMock).toHaveBeenCalledTimes(3)
      expect(data).toEqual(O.some('x'))
      return
    })
  })
})

describe('repetitiveTry', (): void => {
  test('success', async () => {
    const myMock = jest.fn()
    myMock.mockReturnValueOnce(true).mockReturnValueOnce('')
    return _.repetitiveTry(myMock, 3, 0)().then((data) => {
      expect(myMock).toHaveBeenCalledTimes(1)
      expect(data).toEqual('')
      return
    })
  })
  test('success in the second time', async () => {
    const myMock = jest.fn()
    myMock.mockReturnValueOnce(false).mockReturnValueOnce(true).mockReturnValueOnce('')
    return _.repetitiveTry(myMock, 3, 0)().then((data) => {
      expect(myMock).toHaveBeenCalledTimes(2)
      expect(data).toEqual('')
      return
    })
  })
  test('fail', async () => {
    const myMock = jest.fn()
    myMock.mockReturnValueOnce(false).mockReturnValueOnce('fail').mockReturnValueOnce('')
    return _.repetitiveTry(myMock, 3, 0)().then((data) => {
      expect(myMock).toHaveBeenCalledTimes(2)
      expect(data).toEqual('fail')
      return
    })
  })
  test('tried', async () => {
    const myMock = jest.fn()
    myMock
      .mockReturnValueOnce(false)
      .mockReturnValueOnce(false)
      .mockReturnValueOnce(false)
      .mockReturnValueOnce('')
    return _.repetitiveTry(myMock, 3, 0)().then((data) => {
      expect(myMock).toHaveBeenCalledTimes(3)
      expect(data).toEqual('tried')
      return
    })
  })
})
