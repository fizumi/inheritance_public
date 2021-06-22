import { css } from '@emotion/react'
import { Paper, useTheme } from '@material-ui/core'
import React from 'react'
import { IFamilyExtNode } from 'src/libraries/relatives-tree/types'
import { flexCenter } from 'src/app/styles/emotion'
import { useIsomorphicLayoutEffect } from 'src/utils/react/hooks'
import fitty from 'src/libraries/fitty'

interface Props {
  node: IFamilyExtNode
  rootId: string
  onSubClick: (id: string) => void
  style?: React.CSSProperties
}

export default React.memo<Props>(function FamilyNode({ node, rootId, style }) {
  const theme = useTheme()
  const isRoot = rootId === node.id
  const ref = React.useRef<HTMLDivElement>(null)
  useIsomorphicLayoutEffect(() => {
    if (!ref.current) return
    const fitInstance = fitty?.(ref.current, {
      minSize: 1,
      observeMutations: false,
      multiLine: false,
    })
    return () => {
      fitInstance?.unsubscribe()
    }
  }, [])
  return (
    <div css={e.outer} style={style}>
      <Paper
        css={e.middle}
        elevation={isRoot ? 4 : 3}
        style={{
          ...(isRoot ? { border: `1.7px solid ${theme.palette.primary.main}` } : {}),
        }}
      >
        <div css={e.fittyParent /* ※3 */}>
          <div
            ref={ref}
            css={[e.inner]}
            style={{
              display: 'inline-flex' /* ※2 */,
              whiteSpace: 'nowrap' /* ※2 */,
            }}
          >
            {node.name}
          </div>
        </div>
      </Paper>
    </div>
  )
})

const maxSize = css`
  width: 100%;
  height: 100%;
`

const vertical = css`
  writing-mode: vertical-rl;
`
const e = {
  outer: css`
    padding: 10px;
  `,
  middle: css`
    padding: 10px; // fitty だけでは調整しきれないため設定 / 大きくすればするほど文字は小さくなる
    ${maxSize}
  `,
  fittyParent: css`
    ${maxSize}
  `,
  inner: css`
    ${flexCenter}
    ${vertical}
    ${maxSize} /* ※1 */
  `,
}

// ※1 100% にしておくと fitty で拡大されなくなる（縮小はされる）
// ※2 https://github.com/rikschennink/fitty#performance
// ※3 https://github.com/hexetia/react-fitty/blob/main/src/index.tsx にもある通り、
// fitty が適用される要素（fitty element）の親要素 は fitty element と接していないといけない
