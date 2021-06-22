// https://github.com/streamich/react-use/blob/master/src/useUpdate.ts
import { useReducer } from 'react'

const updateReducer = (num: number): number => (num + 1) % 1_000_000

const useUpdate = (): [number, () => void] => {
  const [updateCount, update] = useReducer(updateReducer, 0)
  return [updateCount, update]
}

export default useUpdate

// // eslint-disable-next-line @typescript-eslint/ban-types
// const useUpdate = (): [{}, () => void] => {
//   const [updated, update_] = React.useState({})
//   const update = React.useCallback(() => update_({}), [])
//   return [updated, update]
// }

// export default useUpdate
