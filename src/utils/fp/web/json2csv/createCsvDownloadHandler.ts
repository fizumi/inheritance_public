// https://stackoverflow.com/a/40250341
// import React from 'react'
import * as RA from 'ramda-adjunct'
import { parse } from 'json2csv'
import { buildURIforCSV } from '../../../web/utils'

type ParseOption = Parameters<typeof parse>[1]
export type Props<T> = {
  filename?: string
  uFEFF?: boolean
  data: T[]
  option: ParseOption
}

export default function createCsvDownloadHandler<T>({
  filename = 'csv-data.csv',
  uFEFF = true,
  data,
  option,
}: Props<T>): void {
  let csv
  try {
    csv = parse(data, option)
  } catch (err) {
    console.error(err)
    return
  }
  // In IE11 this method will trigger the file download
  if (RA.isFunction(window.navigator.msSaveOrOpenBlob)) {
    const blob = new Blob([uFEFF ? '\uFEFF' : '', csv])
    window.navigator.msSaveBlob(blob, filename)
    return
  }
  //In FF link must be added to DOM to be clicked
  const link = document.createElement('a')
  link.href = buildURIforCSV(csv, uFEFF)
  link.setAttribute('download', filename)
  link.style.display = 'none'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}
