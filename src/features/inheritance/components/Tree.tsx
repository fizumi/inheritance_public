// https://github.com/SanichKotikov/react-family-tree
import { css } from '@emotion/react'
import React, { useState } from 'react'
import { COLS } from 'src/features/inheritance/model'
import { getFamilyNodes } from 'src/features/inheritance/hooks/formik/utils/getFamilyNodeCreator'
import { DebugModal, DebugObjectProvider } from 'src/app/hooks/useDebugObject'
import ReactFamilyTree from 'src/libraries/relatives-tree/components/ReactFamilyTree'
import { useValuesRef } from '../hooks/formik/formik'
import FamilyNode from './FamilyTree/FamilyNode'

const WIDTH = 60
const HEIGHT = 100

export default React.forwardRef(({ id }: { id: string }, _ref) => {
  const [rootId, setRootId] = useState<string>(id)
  const valuesRef = useValuesRef()
  const nodes = getFamilyNodes(valuesRef.current)

  return (
    <DebugObjectProvider>
      <div css={style}>
        <ReactFamilyTree
          nodes={nodes}
          rootID={rootId}
          width={WIDTH}
          height={HEIGHT}
          baseOrder={valuesRef.current[COLS].id}
          renderNode={(node, style) => (
            <FamilyNode
              key={`${node.id}-${node.generation}-${node.index}`}
              node={node}
              style={style}
              rootId={rootId}
              onSubClick={setRootId}
            />
          )}
          css={css`
            margin: 1em;
          `}
        />
      </div>
      <DebugModal />
    </DebugObjectProvider>
  )
})

const style = css`
  position: relative; /* Modalよりも z-index を上にする */
  background-color: white;
  /* font-family: Sawarabi Mincho だと文字が崩れてしまう */ //
`
