import React from 'react'
// import { css } from '@emotion/react'
import { ColumnProp } from './types'
import PeopleIcon from '@material-ui/icons/People'
import { IconButton, InputAdornment, Modal } from '@material-ui/core'
import { ChipTextField } from '../../shared/ChipTextField'
import Tree from '../../Tree'
import { flexCenter } from 'src/app/styles/emotion'
import { useBoolean, useSequenceMemo, useCancelAndDelay } from 'src/utils/react/hooks'
import {
  useField,
  useEnterKeyForChangingFocusAndAddingRow,
  useFieldInfoMaker,
  useDebugInfo,
} from '../../../hooks/formik'
import { label } from 'src/features/inheritance/model'
import { useDetectTargetChange } from 'src/features/inheritance/hooks/useDetectFieldChange'
import useDependenciesDebugger, { log } from 'src/utils/react/hooks/useDependenciesDebugger'

const Name: React.FC<ColumnProp> = ({ id }) => {
  const { index } = useDebugInfo(id)
  const pathTo = useFieldInfoMaker(id)
  const path = pathTo('name')
  const [{ value, onChange, ref: inputRef, ...otherInputProps_ }] = useField(path)
  const otherInputProps = useSequenceMemo(otherInputProps_)
  const onKeyDown = useEnterKeyForChangingFocusAndAddingRow(path)
  const { subject } = useDetectTargetChange()
  useCancelAndDelay(() => {
    subject.next({
      name: id,
    })
  }, [value])

  const {
    state: open,
    dispatcher: { toggle, setFalse },
  } = useBoolean()

  // useDependenciesDebugger( {id, inputRef, onChange, onKeyDown, otherInputProps, rootRef, toggle, value}, log('Name', index), true) // prettier-ignore
  const textFieldProps = React.useMemo(() => {
    return {
      id,
      label: label.name,
      ...{ value, onChange },
      InputProps: {
        ...otherInputProps,
        endAdornment: (
          <InputAdornment position={'end'}>
            <IconButton aria-label={''} edge={'end'} onClick={toggle}>
              <PeopleIcon />
            </IconButton>
          </InputAdornment>
        ),
      },
      inputRef: inputRef,
      inputProps: onKeyDown,
    }
  }, [id, inputRef, onChange, onKeyDown, otherInputProps, toggle, value])

  // useDependenciesDebugger( {index, textFieldProps, open, setFalse, id}, log('Name', index), true) // prettier-ignore
  return React.useMemo(
    () => {
      console.condlog('component', `Name[${index}] in memo`)
      return (
        <>
          <ChipTextField {...textFieldProps} />
          <Modal
            open={open}
            onClose={setFalse}
            css={flexCenter}
            disableScrollLock
            onContextMenu={(e) => e.stopPropagation()}
          >
            <Tree id={id} />
          </Modal>
        </>
      )
    },
    [index, textFieldProps, open, setFalse, id] // prettier-ignore
  )
}
export default Name
