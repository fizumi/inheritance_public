// https://stackoverflow.com/questions/40589302/how-to-enable-file-upload-on-reacts-material-ui-simple-input?answertab=oldest#tab-top
import { taskEither as TE } from 'fp-ts'
import * as R from 'ramda'
import { flow } from 'fp-ts/lib/function'
import React from 'react'
// import { csvFile2webData } from '../utils/excel' // 前は CSV をロードしていた
import { clearTargetValue, getFile, loadJsonFile } from 'src/utils/fp/web/File'
import { useConstRefFunctions } from '../../hooks/formik'
import Button from '../shared/Button'
import { safeValidateSyncBeforeLoad } from '../../validation/beforeLoad'

const getFormikValuesFromLocalFile = flow(
  getFile,
  TE.fromEither /*※*/,
  TE.chain(loadJsonFile),
  TE.chainEitherKW(safeValidateSyncBeforeLoad)
)
/*
※ Promise のまま扱うと，fp-ts を利用した関数の合成ができなくなるので，TaskEither を利用
*/

export const UploadButton: React.FC = () => {
  const { setValues } = useConstRefFunctions()
  const inputRef = React.useRef<HTMLInputElement>(null)

  const fileHandler = flow(
    R.tap(
      flow(
        getFormikValuesFromLocalFile,
        TE.map(setValues),
        TE.mapLeft((e) => {
          window?.alert('想定外のデータであるため，アップロードを中断しました')
          console.error(e)
        }),
        (task) => task()
      )
    ),
    clearTargetValue
  )

  return (
    <Button onClick={() => inputRef.current?.click()}>
      <input ref={inputRef} type="file" onChange={fileHandler} style={{ display: 'none' }} />
      {'アップロード'}
    </Button>
  )
}
