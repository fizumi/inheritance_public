import * as _ from './function'

describe('retry', (): void => {
  test('fail', async () => {
    const constVoid = jest.fn()
    return _.retry(constVoid, 5, 0).then((data) => {
      expect(constVoid).toHaveBeenCalledTimes(5)
      expect(data).toEqual(false)
      return
    })
  })
  test('success', async () => {
    const myMock = jest.fn()
    myMock.mockReturnValueOnce(false).mockReturnValueOnce(undefined).mockReturnValueOnce(true)
    return _.retry(myMock, 5, 0).then((data) => {
      expect(myMock).toHaveBeenCalledTimes(3)
      expect(data).toEqual(true)
      return
    })
  })
})

describe.only('delay', (): void => {
  test('success', async () => {
    const constVoid = jest.fn()
    const myMock = jest.fn()
    myMock
      .mockReturnValueOnce(false)
      .mockReturnValueOnce(false)
      .mockReturnValueOnce(false)
      .mockReturnValueOnce(true)
    _.delay(myMock, constVoid)
    await new Promise((resolve, reject) => setTimeout(resolve, 1000))
    expect(myMock).toHaveBeenCalledTimes(4)
    expect(constVoid).toHaveBeenCalledTimes(1)
    // expect(delayed).toThrow(Error)
  })
  test('max', async () => {
    const constVoid = jest.fn()
    const myMock = jest.fn()
    myMock.mockReturnValue(false)
    _.delay(myMock, constVoid)
    await new Promise((resolve, reject) => setTimeout(resolve, 1000))
    expect(myMock).toHaveBeenCalledTimes(10)
    expect(constVoid).toHaveBeenCalledTimes(0)
    // expect(delayed).toThrow(Error)
  })
})
