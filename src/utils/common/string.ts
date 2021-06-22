// https://www.yoheim.net/blog.php?q=20191101
export const zenkaku2Hankaku = (str: string) =>
  str.replace(/[Ａ-Ｚａ-ｚ０-９]/g, (s: string) => String.fromCharCode(s.charCodeAt(0) - 0xfee0))

// https://stackoverflow.com/questions/11116501/remove-a-character-at-a-certain-position-in-a-string-javascript
export const removeAt =
  (index: number) =>
  (s: string): string =>
    s.substr(0, index) + s.substr(index + 1)

export const removeA =
  (char: string) =>
  (s: string): string =>
    s.replace(char, '')

export const insertChar = (s: string, char: string, index: number): string => {
  if (index < 0 || s.length < index) return s
  return s.substr(0, index) + char + s.substr(index)
}

export const firstAccepttedCharIndex =
  (accept: (char: string) => boolean) =>
  (start: number) =>
  (s: string): number => {
    let i = start
    while (i < s.length && i >= 0) {
      if (accept(s[i])) return i
      ++i
    }
    return -1
  }

export const firstAcceptCharIndex =
  (acceptOrCleaner: RegExp | ((str: string) => string)) =>
  (s: string) =>
  (start: number): number => {
    const clean = acceptOrCleaner instanceof RegExp ? acceptOnly(acceptOrCleaner) : acceptOrCleaner
    const c = clean(getAfter(start)(s))[0]
    start = s.indexOf(c, start) // 文字列前方（start＋1文字目）から c を検索
    return start
  }

export const acceptOnly =
  (accept: RegExp | ((c: string) => boolean)) =>
  (str: string): string =>
    accept instanceof RegExp
      ? (str.match(accept) || []).join('')
      : str.split('').filter(accept).join('')

export const extractNumbers = (s: string): string => (s.match(/[\d]/g) || []).join('')

export const extractNumberWithoutLeadingZeros = (s: string): string =>
  String(Number(extractNumbers(s)))

export const splitByFirst =
  (separator: string) =>
  (value: string): [string, string] => {
    const [first, ...tail] = value.split(separator)
    return [first, tail.join('')]
  }

export const removeLastChar = (s: string): string => s.slice(0, -1)
export const getLastChar = (s: string): string => s.slice(-1)
export const getOneChar =
  (s: string) =>
  (index: number): string =>
    s.substr(index, 1)
export const getAfter =
  (index: number) =>
  (s: string): string =>
    s.substr(index)

export const getDiffString = (shorter: string, longer: string): string | null => {
  if (shorter.length > longer.length) return null
  const diff = [] as string[]
  for (let si = 0, li = 0; si < shorter.length || li < longer.length; ++si, ++li) {
    while (shorter[si] !== longer[li]) {
      diff.push(longer[li++])
      if (li >= longer.length) {
        break
      }
    }
  }
  return diff.join('')
}
