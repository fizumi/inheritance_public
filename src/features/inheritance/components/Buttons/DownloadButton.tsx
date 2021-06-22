import React from 'react'
import Button from '../shared/Button'
import { useValuesRef } from '../../hooks/formik'
import createJsonDownloadHandler from 'src/utils/fp/web/createJsonDownloadHandler'
// import createCsvDownloadHandler from 'src/utils/createCsvDownloadHandler' // 前は 単純な2次元データだったので csv にしていた

export const DownloadButton: React.FC = () => {
  const valuesRef = useValuesRef() // 頻繁な re-render を防ぐため，useValues は使わない ※
  return React.useMemo(
    () => (
      <Button
        onClick={(e) => {
          e.preventDefault()
          createJsonDownloadHandler({
            obj: valuesRef.current,
          })
        }}
      >
        ダウンロード
      </Button>
    ),
    [valuesRef]
  )
}

// ※ mutableObj.current の COLS と RELS は values の変更を瞬時に取り込むので
// データが反映されないということはないはず
