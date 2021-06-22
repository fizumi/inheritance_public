//github.com/mui-org/material-ui/blob/next/packages/material-ui/src/utils/useControlled.js
/* eslint-disable react-hooks/rules-of-hooks, react-hooks/exhaustive-deps */
import * as React from 'react'

/*
   useControlled は 0arg の controlled プロパティに undefined 以外を渡すと
   何もしない。戻り値は
   [ 0arg の controlled プロパティの値そのまま ,  何もしない関数]
   となる。
   useControlled は 0arg の controlled プロパティに undefined を渡すと
   useState と同一の動作をする。
   default プロパティが useStateに渡される（初期値）。
   name, state プロパティはデバッグ用。
 */
export default function useControlledWithDispatcher<T>(
  controlledOrDefault: T,
  dispatcher?: React.Dispatch<T>
): [T, (newValue: T) => void] {
  const { current: isControlled } = React.useRef(dispatcher !== undefined)
  const [valueState, setValue] = React.useState(controlledOrDefault)
  const value = isControlled ? controlledOrDefault : valueState

  if (process.env.NODE_ENV !== 'production') {
    React.useEffect(() => {
      if (isControlled !== (dispatcher !== undefined)) {
        console.error(
          [
            `useControlled: A component is changing the ${
              isControlled ? '' : 'un'
            }controlled state of to be ${isControlled ? 'un' : ''}controlled.`,
            'Elements should not switch from uncontrolled to controlled (or vice versa).',
            `Decide between using a controlled or uncontrolled ` +
              'element for the lifetime of the component.',
            "The nature of the state is determined during the first render, it's considered controlled if the value is not `undefined`.",
            'More info: https://fb.me/react-controlled-components',
          ].join('\n')
        )
      }
    }, [isControlled])

    const { current: defaultValue } = React.useRef(controlledOrDefault)

    React.useEffect(() => {
      if (!isControlled && defaultValue !== controlledOrDefault) {
        console.error(
          [
            `useControlled: A component is changing the default state of an uncontrolled after being initialized. ` +
              `To suppress this warning opt to use a controlled.`,
          ].join('\n')
        )
      }
    }, [JSON.stringify(controlledOrDefault)])
  }

  const setValueIfUncontrolled = React.useCallback((newValue: T) => {
    if (dispatcher === undefined /* is not controlled */) {
      setValue(newValue)
    } else {
      dispatcher(newValue)
    }
  }, [])

  return [value, setValueIfUncontrolled]
}
