// https://github.com/react-csv/react-csv
import { isSafari } from 'src/utils/web'

export const buildURI = (csv: string, uFEFF?: boolean): string => {
  const type = isSafari() ? 'application/csv' : 'text/csv'
  const BOM = uFEFF ? '\uFEFF' : ''
  const blob = new Blob([BOM, csv], { type })
  const dataURI = `data:${type};charset=utf-8,${BOM}${csv}`

  const URL = window.URL || window.webkitURL

  return typeof URL.createObjectURL === 'undefined' ? dataURI : URL.createObjectURL(blob)
}
