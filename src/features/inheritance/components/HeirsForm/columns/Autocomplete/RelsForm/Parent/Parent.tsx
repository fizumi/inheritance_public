import { css } from '@emotion/react'
import { Paper } from '@material-ui/core'
import { function as F, option as O, readonlyRecord as RR } from 'fp-ts'
import * as R from 'ramda'
import React from 'react'
import { repetitiveGet } from 'src/utils/fp/common'
import { createContextForReference } from 'src/utils/fp/common/yup'
import { setMyDebugMethodToConsole } from 'src/utils/common'
import {
  COLS,
  dateKeyDict,
  ID,
  IP,
  IPs,
  IsParent,
  JA,
  JAs,
  key,
  selector,
} from 'src/features/inheritance/model'
import {
  isParentSchemaForFormik,
  jointAdoptionSchemaForFormik,
  pseudoPartner,
} from 'src/features/inheritance/validation/afterLoad'
import Popper from 'src/libraries/@material-ui/core/PopperWitBackDrop'
import { getFirstErrorFieldPath, makeUseField, useMyFormik } from 'src/libraries/formik'
import Autocomplete from 'src/utils/fp/react/components/@material-ui/FreeSoloMultipleAutocomplete'
import Form from 'src/utils/react/components/Form'
import { useBoolean, useLifecycles } from 'src/utils/react/hooks'
import useCurrent from 'src/utils/react/hooks/useCurrent'
import {
  useCommonAutocompleteProps,
  useOptions,
} from 'src/features/inheritance/hooks/autocomplete/useAutocompleteSettings'
import {
  useConstRefFunctions,
  useFieldsRef,
  usePartialRels,
  useValuesRef,
} from 'src/features/inheritance/hooks/formik'
import { colsPath } from 'src/features/inheritance/hooks/formik/useFieldInfoMaker'
import { MyTextField } from '../../../../../shared/TextField'
import { makeDateComponent } from '../Date'
import { RelsForm } from '../types'
import { PnCTypesRadioButtons } from './PnCTypesRadioButtons'
import { context, PnCRelContext } from './share'

setMyDebugMethodToConsole()
const _key = 'Parent.tsx'
console.setKey(_key)

const Date = makeDateComponent(context) // コンポーネントの外で context を渡す
export const ParentForm: React.FC<RelsForm<IsParent>> = (props) => {
  // console.log('ParentForm render')
  const { id, theOtherID: parentID, close, getIsOpen, disableClose, anchorEl } = props
  const { setPnCRels } = useConstRefFunctions()
  const valuesRef = useValuesRef()
  const name = valuesRef.current[COLS].name[id]
  const parentName = valuesRef.current[COLS].name[parentID]
  // TODO https://www.npmjs.com/package/react-error-boundary でエラーをキャッチする
  const [relID, relation] = F.pipe(
    IPs.safeGetWithIndex(parentID, id)(selector.isParent(valuesRef.current)),
    O.getOrElseW(() => {
      throw new Error()
    })
  )

  const { curRels: curJAs, value: jaIDs } = usePartialRels({
    rKey: 'jointAdoption',
    id: parentID,
    childID: id,
  })
  const jaProps = React.useMemo(() => JAs.getOne(curJAs, jaIDs), [curJAs, jaIDs])
  const _jaProps = useCurrent(jaProps)

  const initialValues = relation
  const localFormik = useMyFormik({
    initialValues,
    validationSchema: isParentSchemaForFormik,
    onSubmit: F.constVoid,
    validateOnMount: false,
    validateOnChange: true,
    validateOnBlur: true,
    contextThunk: () => createContextForReference(_jaProps.current),
    disableIsValidating: true,
  })
  // // ↓ perf に深刻な影響を与える
  // const { setFieldValue } = localFormik
  // React.useMemo(() => setFieldValue(pseudoPartner, jaProps), [jaProps, setFieldValue])

  const isAcutualPnC = React.useMemo(
    () => localFormik.values.type === '実親子',
    [localFormik.values.type]
  )
  const isSpecialPnC = localFormik.values.type === '特別養親子'

  const errorPath = getFirstErrorFieldPath(localFormik.errors)
  disableClose.current = errorPath !== ''
  const focusErrorFieldRef = React.useRef<(() => void) | null>(null)
  focusErrorFieldRef.current =
    focusErrorFieldRef.current === null && errorPath !== '' && !isAcutualPnC
      ? () => {
          localFormik.fieldsRef.current[errorPath]?.focus()
        }
      : null

  const fieldsRef = useFieldsRef()
  useLifecycles({
    onDidMount: () => {
      console.condlog(_key, `mount`, { parentName, }) // prettier-ignore
      const getRef = () =>
        localFormik.fieldsRef.current?.[
          isAcutualPnC ? IP.propDict.type : isSpecialPnC ? pseudoPartner : dateKeyDict.startDate
        ]
      return repetitiveGet(getRef, 4)().then(O.map((ref) => ref.focus()))
    },
    onWillUnmount: () => {
      console.condlog(_key, `unmount`, { open: getIsOpen() })
      if (!getIsOpen() /* right arrow click で他の Form が開かれた場合は, Focus を戻さない */) {
        fieldsRef.current?.[colsPath(key.pseudoParents)(id)]?.focus()
      }
      disableClose.current = false
    },
  })

  const focus = useCurrent(localFormik.focus)
  const pickerOpen = useBoolean(false)
  const closeThisForm = () => {
    if (pickerOpen.state) return

    // if (errorPath !== '' && mouseIsAtAncestor.current) {
    if (focusErrorFieldRef.current) {
      console.condlog(_key, `focus() because error: '${errorPath}'`)
      focusErrorFieldRef.current() // TODO DateForJA の error field もフォーカス出来るようにする ※
      return
    }
    // ※ パッと思いつくのは focusErrorFieldRef.current を JointAdoptionForm に渡して JointAdoptionForm で focusErrorFieldRef.current に focus 関数をセットする

    const formsAreClosed = focus.current === undefined
    if (formsAreClosed) {
      console.condlog(_key, `close because of click ancestor`)
      // ↓ Dates はこのタイミングで update する (setPnCRels を 日付変更時点で使うと, unmount が発生し, 変更毎に DatePicker が閉じてしまう)
      // setPnCRels(RR.upsertAt(relID, localFormik.valuesRef.current))
      // setTimeout(close) // setTimeout で dispatch を処理する時間を作る
      close()
    }
  }

  const autocompleteLabel = isSpecialPnC ? `共同縁組者等` : `共同縁組者`
  // const msgIfjaRelExist = jaProps ? '共同縁組日'
  type DatePropTuple = [string, boolean, boolean] // description, required, disabled
  const tuple2record = ([description, required, disabled]: DatePropTuple) => ({
    description,
    required,
    disabled,
  })

  const startDateLabel = `縁組日`
  const startDateProp = F.flow((): DatePropTuple => {
    if (isSpecialPnC)
      return [
        `下記の「${autocompleteLabel}」を入力後, 「共同縁組日」を入力してください。`,
        false,
        true,
      ]
    if (jaProps)
      return [`共同縁組者を登録する場合、「共同縁組日」を入力してください。`, false, true]
    return [`${name} と ${parentName} との縁組日`, true, false]
  }, tuple2record)()

  const endLabel = `離縁日`
  const endDateProp = F.flow((): DatePropTuple => {
    if (jaProps && jaProps.rel.endDate)
      return [`「共同離縁日」が入力されているため、入力できません。`, false, true]
    return [`${name} と ${parentName} との離縁日`, false, false]
  }, tuple2record)()

  const dispatchLoaclFormik = (value: IsParent) => {
    if (disableClose.current === true) return
    setPnCRels(RR.upsertAt(relID, value))
  }
  // useDependenciesDebugger( { anchorEl, autocompleteLabel, closeThisForm, endDateProp, endLabel, isAcutualPnC, localFormik, name, parentName, pickerOpen, props, relID, startDateLabel, startDateProp, }, log('ParentForm', name), true) // prettier-ignore
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
          <context.Provider
            value={{
              formProps: props,
              formik: localFormik,
              pickerOpen,
              relID,
              names: { name, parentName },
              focusErrorFieldRef,
              jaProps,
              dispatchLoaclFormik,
            }}
          >
            <PnCTypesRadioButtons parentName={parentName} />
            {isAcutualPnC ? null : (
              <>
                <Date field={'startDate'} label={startDateLabel} {...startDateProp} />
                <Date field={'endDate'} label={endLabel} {...endDateProp} />
                <JointAdoptionForm autocompleteLabel={autocompleteLabel} />
              </>
            )}
          </context.Provider>
        </Form>
      </Paper>
    </Popper>
  )
}

const JointAdoptionForm: React.FC<{ autocompleteLabel: string }> = ({
  autocompleteLabel: label,
}) => {
  const [useField, useOther] = makeUseField<PnCRelContext['formik']['values'], PnCRelContext>(
    context
  )
  const [{ value: _v, ref, onChange: _o, ...onBlur_onFocus }, { error, touched }, , localFormik] =
    useField<ID | undefined>(pseudoPartner)
  // console.log('JointAdoptionForm render')

  const {
    formProps: { id, theOtherID: parentID, curRels: parentRels },
    names: { name, parentName },
    jaProps,
  } = useOther()

  const { setRelations } = useConstRefFunctions()

  const { autocompleteOptionProps, optionsFilter } = useOptions([id, parentID])
  const commonProps = useCommonAutocompleteProps()

  const isSpecial = IP.isSpecial(localFormik.values)
  const description = isSpecial
    ? `縁組時の配偶者を入力してください。（民法８１７条の３（夫婦共同縁組））`
    : `夫婦共同縁組の場合、配偶者を入力してください。（民法７９５条）`

  const selectedID = (jaProps?.id ? [jaProps.id] : []) as [string] | []

  return (
    <>
      <Autocomplete
        PopperComponent={({ children, ...other }) => (
          <Popper {...other} onBackdropClick={() => undefined}>
            {children}
          </Popper>
        )}
        renderInput={(params) => {
          const newParams = {
            ...params,
            InputProps: {
              ...params.InputProps,
              ...onBlur_onFocus,
            },
          }
          return (
            <MyTextField
              {...newParams}
              label={label}
              errorMsg={error}
              touched={!!touched}
              description={description}
              required={isSpecial}
              inputRef={ref}
            />
          )
        }}
        {...autocompleteOptionProps}
        {...commonProps}
        filterOptions={(options, params) => {
          const filtered = optionsFilter.filter(options, params)
          return filtered.filter((opt) =>
            F.pipe(
              IPs.safeGet(id, opt.id)(parentRels), // 既に id の親として選択されている者の rel を取得
              O.map((rel) => {
                if (localFormik.values.type === '特別養親子' && rel.type === '実親子') {
                  return true
                }
                // 特別養親は特別養親 と 養親は養親 と 共同縁組できる
                return rel.type === localFormik.values.type
              }),
              O.getOrElseW(F.constTrue) // id の親として選択されていない場合は option に表示
            )
          )
        }}
        selectedIDs={selectedID}
        closeOnSelect={true}
        onChange={(param) => {
          if (param.reason === 'select-option') {
            const partnerID = param.option.id
            const removeCurSelectedID =
              jaProps !== undefined ? JAs.remove(parentID, jaProps.id, id) : F.identity // 既存の共同縁組者は削除
            // 婚姻関係の自動追加は混乱を招きそうなのでやめる
            // const insertMrrgWhenNotExist = Mrrgs.insertAt(
            //   parentID,
            //   partnerID,
            //   Mrrg.create({})
            // )
            F.pipe(
              IPs.safeGetWithIndex(partnerID, id)(parentRels),
              // partnerID が id(子) の 親として 登録されている場合
              O.map(([_rID, rel]) => {
                setRelations(
                  R.evolve({
                    // partner が 実親 でない場合，type を curRel に合わせる
                    [key.isParent]:
                      rel.type !== '実親子'
                        ? IPs.updateAtAt(partnerID, id, IP.propDict.type, localFormik.values.type)
                        : F.identity,
                    [key.jointAdoption]: F.flow(
                      removeCurSelectedID,
                      JAs.upsertAt(
                        parentID,
                        partnerID,
                        id,
                        JA.create({
                          type:
                            rel.type === '実親子'
                              ? JA.typeDict.第817条の3第2項但書等
                              : JA.typeDict.共同縁組,
                        })
                      )
                    ),
                    // [key.marriage]: insertMrrgWhenNotExist,
                  })
                )
              }),
              // 選択された者が id の 親として 登録されていない場合
              O.getOrElse(() => {
                setRelations(
                  R.evolve({
                    [key.isParent]: IPs.upsertAt(
                      partnerID,
                      id,
                      IP.create({
                        type: localFormik.values.type,
                      })
                    ),
                    [key.jointAdoption]: F.flow(
                      removeCurSelectedID,
                      JAs.upsertAt(
                        parentID,
                        partnerID,
                        id,
                        JA.create({
                          type: JA.typeDict.共同縁組,
                        })
                      )
                    ),
                    // [key.marriage]: insertMrrgWhenNotExist,
                  })
                )
              })
            )
          }
          if (param.reason === 'remove-option') {
            const partnerID = param.option.id
            // setJointAdoptionRels(JAs.remove(parentID, param.option.id, id))
            setRelations(
              R.evolve({
                [key.isParent]: F.flow(
                  jaProps && localFormik.values.type === '特別養親子'
                    ? IPs.updateAtAt(partnerID, id, 'type', '養親子') // エラー発生回避目的 本当は別のやり方の方がいいかもしれないが時間がないので
                    : R.identity
                ),
                [key.jointAdoption]: JAs.remove(parentID, param.option.id, id),
              })
            )
            localFormik.fieldsRef.current[pseudoPartner]?.focus()
          }
        }}
      />
      {jaProps ? <JointDates names={{ name, parentName }} jaProps={jaProps} /> : null}
    </>
  )
}

const jaCtx = React.createContext({})
const DateForJA = makeDateComponent(jaCtx)
const JointDates: React.FC<
  Pick<PnCRelContext, 'names'> & {
    jaProps: NonNullable<PnCRelContext['jaProps']>
  }
> = ({ names: { name, parentName }, jaProps }) => {
  const valuesRef = useValuesRef()
  const parnerName = valuesRef.current[COLS].name[jaProps.id]
  const { setJointAdoptionRels } = useConstRefFunctions()
  const {
    pickerOpen,
    formProps: { disableClose },
    formik: parentFormik,
    focusErrorFieldRef,
  } = React.useContext<PnCRelContext>(context as any)

  const initialValues = jaProps.rel
  const isParent = useCurrent(parentFormik.values)
  const jaLocalFormik = useMyFormik({
    initialValues,
    validationSchema: jointAdoptionSchemaForFormik,
    onSubmit: F.constVoid,
    validateOnMount: false,
    validateOnChange: true,
    validateOnBlur: true,
    disableIsValidating: true,
    contextThunk: () => createContextForReference(isParent.current),
  })

  const errorPath = getFirstErrorFieldPath(jaLocalFormik.errors)
  disableClose.current = errorPath !== ''
  focusErrorFieldRef.current =
    errorPath !== ''
      ? () => {
          jaLocalFormik.fieldsRef.current[errorPath]?.focus()
        }
      : null

  useLifecycles({
    onDidMount: () => {
      setTimeout(() => jaLocalFormik.fieldsRef.current?.[dateKeyDict.startDate]?.focus()) // focus するには, setTimeout 必要
    },
    onWillUnmount: () => {
      console.log('DateForJA onWillUnmount')
      disableClose.current = false
      focusErrorFieldRef.current = null
      parentFormik.fieldsRef.current?.[dateKeyDict.startDate]?.focus()
    },
  })

  React.useEffect(() => {
    console.log('JointDates useEffect')
    setJointAdoptionRels(RR.upsertAt(jaProps.rID, jaLocalFormik.values))
  }, [jaProps.rID, jaLocalFormik.values, setJointAdoptionRels])

  const 養親側の場合 =
    parentFormik.values.type !== '実親子' && jaProps.rel.type === '第817条の3第2項但書等'
  const startLabel = `共同縁組日`
  const startLabelLong = 養親側の場合
    ? `${parentName} が ${parnerName} の嫡出子である ${name} と縁組した日`
    : `${parentName} と ${parnerName} とが、共同で ${name} と縁組した日`
  const endLabel = `共同離縁日`
  const endLabelLong = `${parentName} と ${parnerName} とが、共同で ${name} と離縁した日`
  // const partnerLabel = `${name} を ${parentName} と共同で養子とした者, または, 縁組時 ${name} の実親であった者`

  const dispatchLoaclFormik = (value: JA.JointAdoption) => {
    if (disableClose.current === true) return
    setJointAdoptionRels(RR.upsertAt(jaProps.rID, value))
  }
  return (
    <jaCtx.Provider value={{ formik: jaLocalFormik, pickerOpen, dispatchLoaclFormik }}>
      <DateForJA field={'startDate'} label={startLabel} required description={startLabelLong} />
      <DateForJA field={'endDate'} label={endLabel} description={endLabelLong} />
    </jaCtx.Provider>
  )
}
