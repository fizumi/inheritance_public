import { css } from '@emotion/react'
import React from 'react'
import { flexColumn } from 'src/app/styles/emotion'
import { Buttons } from 'src/features/inheritance/components/Buttons'
import Head from 'src/features/inheritance/components/Head'
import { ContextMenuBox } from 'src/features/inheritance/components/ContextMenu'
import { HeirsForm } from 'src/features/inheritance/components/HeirsForm'
import Provider from 'src/features/inheritance/components/Provider'
import { SearchMordal } from 'src/features/inheritance/components/SearchMordal'
import {
  useFocusedPath,
  useFormikState,
  useStatus,
  useValuesRef,
} from 'src/features/inheritance/hooks/formik'
import { useUpdate } from 'src/utils/react/hooks'
import { DebugStateModal } from 'src/app/hooks/useDebugState'
import { fontFamily } from 'src/app/styles/static'

const Inheritance: React.FC = () => {
  return (
    <ContextMenuBox
      css={css`
        label: Page-wrapper;
        overflow-x: hidden; // 不要な横スクロールバーが出現してしまうのを防止
        ${flexColumn}
      `}
    >
      <Head />
      <HeirsForm />
      <Buttons />
      <SearchMordal />
    </ContextMenuBox>
  )
}

export default function Page(): JSX.Element {
  return (
    <Provider>
      <Inheritance />
      <DebugDisplay />
    </Provider>
  )
}

const DebugDisplay: React.FC = () => {
  const state = useFormikState()
  const focus = useFocusedPath()
  // const fieldsRef = useFieldsRef()
  // console.log('fieldsRef', fieldsRef.current)
  const [updateCnt, update] = useUpdate()
  // console.log(useFocusedID())
  // const nodes = getFamilyNodes(useValuesRef().current)
  return (
    <div onClick={update} data-manual-update-cnt={updateCnt}>
      <DebugStateModal
        objArray={[
          { focus },
          { state },
          { status: useStatus()[0] },
          { useValuesRef: useValuesRef().current },
          // { nodes },
        ]}
      />
    </div>
  )
}
