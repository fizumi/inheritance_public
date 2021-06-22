import React from 'react'
import { __DEV__ } from 'src/utils/common'
import { useGlobalKeyDown, useBoolean } from 'src/utils/react/hooks'
import { Modal } from '@material-ui/core'
import { flexCenter, flexRow } from 'src/app/styles/emotion'
import { css } from '@emotion/react'
import constate, { name } from 'src/libraries/constate'

type Obj = Record<string, any>
const globalObjArray = [] as Obj[]
export const add = (key: string) => (obj: Obj) => globalObjArray.push({ [key]: obj })

export const reset = () => (globalObjArray.length = 0)

export const [DebugObjectProvider, useDebugObject, useDebugObjectFns] = constate(
  () => {
    const {
      state: open,
      dispatcher: { toggle, setFalse },
    } = useBoolean()

    useGlobalKeyDown(
      {
        d: (event: KeyboardEvent) => {
          if (event.ctrlKey) {
            toggle()
            event.preventDefault()
          } else if (event.shiftKey) {
            alert('shift d') // なぜか動作しない
            reset()
            event.preventDefault()
          } else if (event.altKey) {
            alert('alt d')
            reset()
            event.preventDefault()
          }
        },
      },
      __DEV__
    )

    const fns = React.useMemo(
      () => ({
        toggle,
        setFalse,
      }),
      [setFalse, toggle]
    )

    return { fns, open }
  },
  name('useDebugObject')((bag) => bag),
  name('useDebugObjectFns')((bag) => bag.fns)
)

export const DebugModal = () => {
  const {
    fns: { setFalse },
    open,
  } = useDebugObject()
  return (
    <Modal open={open} onClose={setFalse}>
      <div
        css={[
          flexCenter,
          css`
            width: 100vw;
            height: 100vh;
          `,
        ]}
      >
        <div
          css={[
            flexRow,
            css`
              max-width: 90vw;
              max-height: 90vh;
              overflow: auto;
            `,
          ]}
        >
          {globalObjArray.map((obj, index) => (
            <DisplayObject key={index} obj={obj} />
          ))}
        </div>
      </div>
    </Modal>
  )
}
// eslint-disable-next-line @typescript-eslint/ban-types
const DisplayObject: React.FC<{ obj: {} }> = ({ obj }) => {
  return (
    <div
      css={css`
        margin: 0.5rem;
      `}
    >
      <pre
        css={css`
          background: #f6f8fa;
          padding: 0.5rem;
          font-family: 'Menlo';
          font-size: 0.65rem;
          color: #ff00aa;
        `}
      >
        <strong>{Object.keys(obj)[0]}</strong> ={' '}
        {JSON.stringify(Object.values(obj)[0], replacer, 2)}
      </pre>
    </div>
  )
}

// https://stackoverflow.com/a/56150320
function replacer(key: string, value: any) {
  if (value instanceof Map) {
    return {
      dataType: 'Map',
      value: Array.from(value.entries()), // or with spread: value: [...value]
    }
  } else {
    return value
  }
}
