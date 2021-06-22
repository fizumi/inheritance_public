import React from 'react'
import { __DEV__ } from 'src/utils/common'
import { useGlobalKeyDown, useBoolean, useTimeoutFn } from 'src/utils/react/hooks'
import { Modal } from '@material-ui/core'
import { flexCenter, flexRow } from 'src/app/styles/emotion'
import { css } from '@emotion/react'

type Obj = Record<string, any>

const useDebugState = (eventKey = 'D') => {
  const {
    state: open,
    dispatcher: { toggle, setFalse },
  } = useBoolean()
  const [, cancel, set] = useTimeoutFn(toggle, 0, false) // debounce

  useGlobalKeyDown(
    {
      [eventKey]: (event: KeyboardEvent) => {
        cancel()
        set()
        event.preventDefault()
      },
    },
    __DEV__
  )

  return { setFalse, toggle, open }
}

export const DebugStateModal: React.FC<{ eventKey?: string; objArray: Obj[] }> = ({
  eventKey,
  objArray,
}) => {
  const { setFalse, open } = useDebugState(eventKey)
  return (
    <Modal open={open} onClose={setFalse} disableEnforceFocus disableAutoFocus>
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
          {objArray.map((obj, index) => (
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
