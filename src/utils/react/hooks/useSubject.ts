/* eslint-disable react-hooks/exhaustive-deps */
// c.f. https://github.com/react-hook-form/react-hook-form/blob/master/src/useForm.ts
import React from 'react'
import Subject, { Observer } from 'src/utils/common/Subject'
import { useUpdate } from 'src/utils/react/hooks'

type ObserverCreator<T> = (forceRender: () => void) => Observer<T>

const useSubject = <T>() => {
  const { current: subject } = React.useRef(new Subject<T>())

  const useSubscribe = (observerCreator: ObserverCreator<T>, deps?: React.DependencyList) => {
    const [updateCount, update] = useUpdate()
    React.useEffect(() => {
      const subscription = subject.subscribe(observerCreator(update))
      return () => {
        subscription.unsubscribe()
      }
    }, deps)
    return updateCount
  }

  return React.useMemo(() => ({ subject, useSubscribe }), [])
}
export default useSubject
