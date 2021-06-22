// getTimezoneOffset は謎過ぎるから使わないべき
// - new Date(1887, 1, 1).getTimezoneOffset() は -558
// - new Date(1888, 1, 1).getTimezoneOffset() は -540
/**
 * @deprecated
 */
export const getLocalDate = (y: number, m: number, d: number): Date =>
  new Date(new Date(y, m - 1, d).getTime() - new Date().getTimezoneOffset() * 60 * 1000)

export const nowInJapan = (): Date => new Date(Date.now() + 32400000 /* 9 * 60 * 60 * 1000 */)

export const now = (): string =>
  new Date().toLocaleString('ja', {
    timeZone: 'Asia/Tokyo',
  })

export const jpDateTimeFormat = new Intl.DateTimeFormat(['ja-JP-u-ca-japanese'], { era: 'narrow' })

const jpEra = 'MTSHR'
export const normalizeJpEra = (s: string, defaultTo = ''): string => {
  if (s.length !== 1 || !jpEra.includes(s.toUpperCase())) return defaultTo
  return s.toUpperCase()
}

type FormatKey = 'J' | 'b' | 'k' | 'K'

// https://github.com/exizlynx/JapaneseDate/blob/master/JapaneseDate.js

const twoDigit = (s: string | number) => ('0' + s).slice(-2)

export const toJpYear = (yearString: string): string => {
  if (yearString.length !== 4) return ''
  const numY = parseInt(yearString)
  if (isNaN(numY)) return ''
  if (numY > 2018) return 'R' + twoDigit(numY - 2018)
  if (numY > 1988) return 'H' + twoDigit(numY - 1988)
  if (numY > 1925) return 'S' + twoDigit(numY - 1925)
  if (numY > 1911) return 'T' + twoDigit(numY - 1911)
  if (numY > 1867) return 'M' + twoDigit(numY - 1867)
  return ''
}

/**
 * 和暦変換
 */
const eraTypes = [
  {
    name: '令和',
    name_short: 'R',
    timestamp: new Date(2019, 4, 1),
  },
  {
    name: '平成',
    name_short: 'H',
    timestamp: new Date(1989, 0, 8),
  },
  {
    name: '昭和',
    name_short: 'S',
    timestamp: new Date(1926, 11, 25),
  },
  {
    name: '大正',
    name_short: 'T',
    timestamp: new Date(1912, 6, 30),
  },
  {
    name: '明治',
    name_short: 'M',
    timestamp: new Date(1868, 0, 25),
  },
] as const

function getEraNameList(type: number): string[] {
  const list = []
  for (let i = 0; i < eraTypes.length; i++) {
    const obj = eraTypes[i]
    if (type === 1) list.push(obj.name)
    if (type === 2) list.push(obj.name_short)
  }
  return list
}

export function dateToJpn(targetDate: Date, formatKey: FormatKey): string {
  for (let i = 0; i < eraTypes.length; i++) {
    const obj = eraTypes[i]
    if (targetDate.getTime() >= obj.timestamp.getTime()) {
      if (formatKey === 'b') return obj.name_short
      if (formatKey === 'J') return obj.name
      targetDate = new Date(
        targetDate.getUTCFullYear() - (obj.timestamp.getUTCFullYear() - 1),
        targetDate.getMonth(),
        targetDate.getDate()
      )
      if (formatKey === 'k' || formatKey === 'K') {
        let dispEra = targetDate.getUTCFullYear().toString().substr(-2)
        if (formatKey === 'k' && dispEra.toString() === '1') dispEra = '元'
        return dispEra
      }
    }
  }
  return ''
}

/**
 * 文字列をDateオブジェクトに変換
 * この関数は開始日を考慮できない
 */
export function parse(dateString: string): Date | null {
  let regExp = null
  // format: 20010203
  // if (dateString.match(/^\d{4}\/?\d{1,2}\/?\d{1,2}/)) {
  //   const data = dateString.match(/^(\d{4})\/?(\d{1,2})\/?(\d{1,2})/)
  //   return new Date(parseInt(data[1], 10), parseInt(data[2], 10) - 1, parseInt(data[3], 10))
  // }
  // format: H210203 | H21/02/03
  regExp = new RegExp(
    '^([' + getEraNameList(2).join('|') + '])(\\d{1,2})\\/?(\\d{1,2})\\/?(\\d{1,2})+$'
  )
  // 'H21/02/03'.match(/^([H])(\d{1,2})\/?(\d{1,2})\/?(\d{1,2})+$/)
  const data = dateString.match(regExp)
  if (data) {
    for (let i = 0; i < eraTypes.length; i++) {
      const obj = eraTypes[i]
      if (data[1] == obj.name_short) {
        const newYear = parseInt(data[2], 10) + (obj.timestamp.getUTCFullYear() - 1)
        return new Date(newYear, parseInt(data[3], 10) - 1, parseInt(data[4], 10))
      }
    }
  }
  // // format 2001年02月03日
  // if (dateString.match(/^\d{4}[年]\d{1,2}[月]\d{1,2}[日]/)) {
  //   const data = dateString.match(/^(\d{4})[年](\d{1,2})[月](\d{1,2})[日]/)
  //   return new Date(parseInt(data[1], 10), parseInt(data[2], 10) - 1, parseInt(data[3], 10))
  // }
  // // format: 平成21年2月3日
  // regExp = new RegExp(
  //   '^([' + getEraNameList(1).join('|') + ']+)(\\d{1,3})年(\\d{1,2})[月](\\d{1,2})[日]+$'
  // )
  // if (dateString.match(regExp)) {
  //   const data = dateString.match(regExp)
  //   for (var i = 0; i < eraTypes.length; i++) {
  //     const obj = eraTypes[i]
  //     if (data[1] == obj.name) {
  //       const newYear = parseInt(data[2], 10) + (obj.timestamp.getUTCFullYear() - 1)
  //       return new Date(newYear, parseInt(data[3], 10) - 1, parseInt(data[4], 10))
  //     }
  //   }
  // }
  return null
}

/**
 * 日付のフォーマット
 * bKK/MM/DD
 */
export function format(date: Date, format = 'YYYY-MM-DD hh:mm:ss.SSS'): string {
  if (!date) return ''
  if (date.getTime() < eraTypes[eraTypes.length - 1].timestamp.getTime()) return '' // 明治よりも過去は対応しない
  format = format.replace(/YYYY/g, String(date.getUTCFullYear()))
  format = format.replace(/MM/g, ('0' + date.getMonth()).slice(-2))
  format = format.replace(/DD/g, ('0' + date.getDate()).slice(-2))
  format = format.replace(/hh/g, ('0' + date.getHours()).slice(-2))
  format = format.replace(/mm/g, ('0' + date.getMinutes()).slice(-2))
  format = format.replace(/ss/g, ('0' + date.getSeconds()).slice(-2))
  format = format.replace(/J/g, dateToJpn(date, 'J'))
  format = format.replace(/b/g, dateToJpn(date, 'b'))
  format = format.replace(/k/g, dateToJpn(date, 'k'))
  format = format.replace(/K/g, dateToJpn(date, 'K'))
  return format
}
