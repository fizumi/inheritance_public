// https://stackoverflow.com/a/64298689 & https://www.tektutorialshub.com/typescript/typescript-tagged-templates/
/**
 * for using extension's syntax highlighting (jpoissonnier.vscode-styled-components)
 */
export const styled = {
  echo: (strings: TemplateStringsArray, ...vars: any[]): string => {
    let result = ''
    strings.forEach((str, i) => {
      result += `${str}${i === strings.length - 1 ? '' : vars[i]}`
    })
    return result
  },
}
