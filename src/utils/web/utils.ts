// Simple safari detection based on user agent test // https://github.com/react-csv/react-csv
export const isSafari = (): boolean => /^((?!chrome|android).)*safari/i.test(navigator.userAgent)

// https://github.com/react-csv/react-csv
export const buildURIforCSV = (csv: string, uFEFF?: boolean): string => {
  const type = isSafari() ? 'application/csv' : 'text/csv'
  const BOM = uFEFF ? '\uFEFF' : ''
  const blob = new Blob([BOM, csv], { type })
  const dataURI = `data:${type};charset=utf-8,${BOM}${csv}`

  const URL = window.URL || window.webkitURL

  return typeof URL.createObjectURL === 'undefined' ? dataURI : URL.createObjectURL(blob)
}

// https://stackoverflow.com/a/52297652
export const buildURIforJSON = (json: string): string => {
  const type = isSafari() ? 'application/json' : 'text/plain'
  const encoded = encodeURIComponent(json)
  const dataURI = `data:${type};charset=utf-8,${encoded}`

  return dataURI
}

// https://github.com/atomiks/tippyjs-react/blob/master/src/utils.js
export const isBrowser = typeof window !== 'undefined' && typeof document !== 'undefined'
