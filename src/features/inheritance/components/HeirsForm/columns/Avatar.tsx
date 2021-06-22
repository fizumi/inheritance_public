// import * as R from 'ramda'
import { css } from '@emotion/react'
import Tippy from '@tippyjs/react'
import MuiAvatar from '@material-ui/core/Avatar'
import { grey } from '@material-ui/core/colors'
import React from 'react'
import { flexCenter } from 'src/app/styles/emotion'
import { staticTheme } from 'src/app/styles/theme'
import { useField, useFieldInfoMaker, useStatus } from '../../../hooks/formik'
import { letter2status, StatusLetter } from '../../../hooks/formik/status'
import { ColumnProp } from './types'

const Avatar: React.FC<ColumnProp> = ({ id }) => {
  const pathTo = useFieldInfoMaker(id)
  const path = pathTo('isAlive')
  const [, , { setValue }] = useField(path)
  const [status] = useStatus()
  const curStatus = status[id]

  return React.useMemo(() => {
    const onClick = () => {
      setValue(curStatus === '亡')
    }
    return (
      <div
        css={css`
          height: 100%;
          width: 100%;
          ${flexCenter}
          justify-content: space-around;
        `}
      >
        <Tippy content={letter2status[curStatus]}>
          <MuiAvatar
            {...{ onClick }}
            css={[
              css`
                &:hover {
                  cursor: pointer;
                }

                font-size: 1rem;
                width: 1.7em;
                height: 1.7em;
              `,
              switchColor(curStatus),
            ]}
          >
            {curStatus}
          </MuiAvatar>
        </Tippy>
      </div>
    )
  }, [curStatus, setValue])
}

export default Avatar

const switchColor = (letter: StatusLetter | undefined) => {
  switch (letter) {
    case '亡':
      return css`
        background-color: ${grey[300]}; // https://next--material-ui.netlify.app/customization/color/#color-palette
      `
    case '被':
      return css`
        background-color: ${grey[800]};
      `
    case '相':
      return css`
        background-color: ${staticTheme.palette.primary.main};
      `
  }
}
