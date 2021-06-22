import React from 'react'
import { css } from '@emotion/react'

// eslint-disable-next-line @typescript-eslint/ban-types
export const DisplayObject: React.FC<{ obj: {} }> = ({ obj }) => {
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
