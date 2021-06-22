import { css } from '@emotion/react'
import { Paper } from '@material-ui/core'
import { function as F, option as O, readonlyRecord as RR } from 'fp-ts'
import React from 'react'
import { COLS, dateKeyDict, key, Marriage, selector } from 'src/features/inheritance/model'
import { Mrrgs } from 'src/features/inheritance/model/relations'
import { marriageSchema } from 'src/features/inheritance/validation/afterLoad'
import { setMyDebugMethodToConsole } from 'src/utils/common'
import Form from 'src/utils/react/components/Form'
import { useBoolean, useLifecycles } from 'src/utils/react/hooks'
import useCurrent from 'src/utils/react/hooks/useCurrent'
import Popper from 'src/libraries/@material-ui/core/PopperWitBackDrop'
import { getFirstErrorFieldPath, useMyFormik } from 'src/libraries/formik'
import {
  useConstRefFunctions,
  useFieldsRef,
  useValuesRef,
} from 'src/features/inheritance/hooks/formik'
import { colsPath } from 'src/features/inheritance/hooks/formik/useFieldInfoMaker'
import { makeDateComponent } from './Date'
import { RelsForm } from './types'

setMyDebugMethodToConsole()
const _key = 'Marriage.tsx'
console.setKey(_key)

const context = React.createContext({})
const Date = makeDateComponent(context)

export const MarriageForm: React.FC<RelsForm<Marriage>> = ({
  id,
  theOtherID: spouseID,
  close,
  getIsOpen,
  disableClose,
  anchorEl,
}) => {
  // const { setRels, getRelations } = useRelations(key.marriage)
  const { setMarriageRels } = useConstRefFunctions()
  const valuesRef = useValuesRef()
  // TODO https://www.npmjs.com/package/react-error-boundary でエラーをキャッチする （マーク済み）
  const [relID, relation] = F.pipe(
    Mrrgs.safeGetWithIndex(id, spouseID)(selector.marriage(valuesRef.current)),
    O.getOrElseW(() => {
      throw new Error()
    })
  )

  const localFormik = useMyFormik({
    initialValues: relation,
    validationSchema: marriageSchema,
    onSubmit: F.constVoid,
    validateOnMount: true,
    validateOnChange: true,
    validateOnBlur: true,
  })

  const errorPath = React.useMemo(
    () => getFirstErrorFieldPath(localFormik.errors),
    [localFormik.errors]
  )
  disableClose.current = errorPath !== ''

  const fieldsRef = useFieldsRef()
  useLifecycles({
    onDidMount: () => {
      console.condlog(_key, `mount`, { spouseID })
      localFormik.fieldsRef.current[dateKeyDict.startDate]?.focus()
    },
    onWillUnmount: () => {
      console.condlog(_key, `unmount`, { open: getIsOpen() })
      if (!getIsOpen() /* right arrow click で他の Form が開かれた場合は, Focus を戻さない */) {
        fieldsRef.current?.[colsPath(key.pseudoSpouses)(id)]?.focus()
      }
      disableClose.current = false
    },
  })

  const focus = useCurrent(localFormik.focus)
  const pickerOpen = useBoolean(false)
  const closeThisForm = () => {
    if (pickerOpen.state) return

    // if (errorPath !== '' && mouseIsAtAncestor.current) {
    if (errorPath !== '') {
      console.condlog(_key, `focus() because error: '${errorPath}'`, localFormik.errors)
      localFormik.fieldsRef.current[errorPath]?.focus()
      return
    }

    const formsAreClosed = focus.current === undefined
    if (formsAreClosed) {
      console.condlog(_key, `close because of click ancestor`)
      close()
    }
  }
  const dispatchLoaclFormik = (value: Marriage) => {
    if (disableClose.current === true) return
    setMarriageRels(RR.upsertAt(relID, value))
  }

  const spouseName = valuesRef.current[COLS].name[spouseID]
  return (
    <Popper anchorEl={anchorEl} open placement={'right-start'} onBackdropClick={closeThisForm}>
      <Paper
        onClick={(e) => {
          e.stopPropagation() // React Tree 上の 親コンポーネント である, Option に click event を伝えない
        }}
        elevation={8}
        css={css`
          padding: 0.8em;
        `}
      >
        <Form>
          <context.Provider value={{ formik: localFormik, pickerOpen, dispatchLoaclFormik }}>
            <Date field={'endDate'} label={`${spouseName} との離婚日`} />
          </context.Provider>
        </Form>
      </Paper>
    </Popper>
  )
}
