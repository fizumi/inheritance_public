import React from 'react'
import { css } from '@emotion/react'
import { fontFamily } from 'src/app/styles/static'
import { UploadButton } from './UploadButton'
import { CalcInheritanceButton } from './CalcInheritanceButton'
import { DownloadButton } from './DownloadButton'

export const Buttons = React.forwardRef<HTMLDivElement>((_, ref) => {
  return React.useMemo(() => {
    console.log('[Buttons]render')
    return (
      <div
        ref={ref}
        css={css`
          label: Buttons-container;
          padding: 1em 1em 1em 0;
          .MuiButtonBase-root + .MuiButtonBase-root {
            margin-left: 0.4em;
          }

          display: flex;
          flex-flow: row nowrap;
          justify-content: flex-end;

          button {
            font-family: ${fontFamily};
          }
        `}
      >
        <CalcInheritanceButton />
        <DownloadButton />
        <UploadButton />
      </div>
    )
  }, [ref])
})

export default Buttons
