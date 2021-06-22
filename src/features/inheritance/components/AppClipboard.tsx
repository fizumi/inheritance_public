import { css } from '@emotion/react'
import { Avatar, useTheme } from '@material-ui/core'
import AssignmentIcon from '@material-ui/icons/Assignment'
import AttachFileIcon from '@material-ui/icons/AttachFile'
import React from 'react'
import { flexCenter, flexColumn, flexColumnCenter } from 'src/app/styles/emotion'
import { COLS } from 'src/features/inheritance/model'
import { useValuesRef } from '../hooks/formik'
import { useAppClipboard } from '../hooks/useAppClipboard'
import { DraggableChip } from './shared/DraggableChip'
import { useHoverState } from 'src/utils/react/hooks/useHover'
import CloseIcon from '@material-ui/icons/Close'
export const AppClipboard: React.FC = () => {
  const {
    copiedIDs,
    dispatcher: { remove, clear },
  } = useAppClipboard()
  const valuesRef = useValuesRef()
  const names = valuesRef.current[COLS].name
  const theme = useTheme()
  const { setElement, isHovered } = useHoverState<HTMLDivElement>()
  return copiedIDs.length ? (
    <div css={[tippyDefaultWrapper, wrapper]}>
      <div
        css={css`
          ${tippyBGColor}
          width: 2.5em;
          height: 2.5em;
          border-radius: 50%;
          z-index: 1;
          margin-bottom: -1.4em;
          ${flexCenter}
        `}
      >
        <Avatar
          ref={setElement}
          css={css`
            width: 1.5em;
            height: 1.5em;
            background-color: ${theme.palette.grey[200]};
          `}
        >
          {isHovered ? (
            <CloseIcon sx={{ color: theme.palette.grey[500] }} onClick={clear} />
          ) : (
            <AssignmentIcon sx={{ color: theme.palette.grey[500] }} />
          )}
        </Avatar>
      </div>
      <div css={[tippyDefault, style, flexColumn]}>
        {copiedIDs.map((id, index) => (
          <DraggableChip
            key={id}
            id={id}
            icon={<AttachFileIcon />}
            label={names[id]}
            size={'small' as const}
            onDelete={() => remove(index)}
            disablePushToCB
            css={css`
              background-color: ${theme.palette.grey[200]};
            `}
          />
        ))}
      </div>
    </div>
  ) : null
}

const tippyBGColor = css`
  background-color: #333;
`
const tippyDefaultWrapper = css`
  z-index: 9999;
  visibility: visible;
  position: absolute;
  inset: auto auto 0px 0px;
  margin: 0px;
`
const wrapper = css`
  ${flexColumnCenter}
  top: 4em;
  right: 2em;
  left: auto;
  bottom: auto;
  height: fit-content;
  width: fit-content;
`
const tippyDefault = css`
  ${tippyBGColor}
  position: relative;
  color: #fff;
  border-radius: 0.5em;
  font-size: 14px;
  line-height: 1.4;
  outline: 0;
  transition-property: transform, visibility, opacity;
`
const style = css`
  /* display: table; // https://stackoverflow.com/a/7875637 */
  padding: 2em 0.5em 0.5em 0.5em;
  width: fit-content;
  .MuiChip-root + .MuiChip-root {
    margin-top: 0.5em;
  }
`
