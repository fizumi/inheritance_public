// https://stackoverflow.com/a/40250341
import * as R from 'ramda'
import * as RA from 'ramda-adjunct'
import { buildURIforJSON } from '../../web/utils'
import * as J from 'fp-ts/Json'
import { pipe } from 'fp-ts/function'
import { either as E, function as F } from 'fp-ts'

export type Props = {
  filename?: string
  uFEFF?: boolean
  obj: any
}

export default function createJsonDownloadHandler({
  filename = 'json-data.json',
  uFEFF = true,
  obj,
}: Props): void {
  const json = pipe(
    J.stringify(obj),
    E.mapLeft(R.tap((e) => console.error(e))),
    E.getOrElse(F.constant(''))
  )
  // In IE11 this method will trigger the file download
  if (RA.isFunction(window.navigator.msSaveOrOpenBlob)) {
    const blob = new Blob([uFEFF ? '\uFEFF' : '', json])
    window.navigator.msSaveBlob(blob, filename)
    return
  }
  //In FF link must be added to DOM to be clicked
  const link = document.createElement('a')
  link.href = buildURIforJSON(json)
  link.setAttribute('download', filename)
  link.style.display = 'none'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

// c.f.
// https://stackoverflow.com/a/52297652
