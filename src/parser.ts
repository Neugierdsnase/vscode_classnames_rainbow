import * as vscode from 'vscode'
import { StringRangeIndices, MatchedLine } from './types'
import { Utility } from './utility'

export class Parser {
  constructor(private readonly utility: Utility) { }

  private findIndexOf = (text: string, searchString: string) => {
    const index = text.indexOf(searchString)
    return index === -1 ? undefined : index
  }

  private findIndexOfClassName = (text: string, searchString: string) => {
    const firstTry = this.findIndexOf(text, ` ${searchString} `)
    if (firstTry !== undefined) { return firstTry + 1 }
    const secondTry = this.findIndexOf(text, `${searchString} `)
    if (secondTry !== undefined) { return secondTry }
    const thirdTry = this.findIndexOf(text, ` ${searchString}`)
    if (thirdTry !== undefined) { return thirdTry + 1 }
    return this.findIndexOf(text, searchString) || 0
  }

  getIndividualClassNameIndices = (
    [classListStart]: StringRangeIndices,
    classList: string,
  ): StringRangeIndices[] => {
    // TODO: handle conditional classes in template literals
    const classNameIndices = classList
      .split(' ')
      .map((className) => {
        if (className === '') {
          return undefined
        }
        const classNameStart = classListStart + this.findIndexOfClassName(classList, className)
        const classNameEnd = classNameStart + className.length
        return [classNameStart, classNameEnd]
      })
      .filter(Boolean) as StringRangeIndices[]

    return classNameIndices
  }

  getIndexofQuotes = (string: string) =>
    this.utility.getSmallestValue([
      string.indexOf('"'),
      string.indexOf("'"),
      string.indexOf('`'),
    ])

  getIndicesOfQuotes = (
    startLookingAt: number,
    text: string,
  ): StringRangeIndices | undefined => {
    const relevantString = text.slice(startLookingAt)
    const startIndex =
      this.getIndexofQuotes(relevantString) + startLookingAt + 1
    if (startIndex < startLookingAt) {
      return
    }
    const stringAfterStart = text.slice(startIndex + 1)
    const endIndex = this.getIndexofQuotes(stringAfterStart) + startIndex + 1
    if (endIndex === startIndex) {
      return
    }

    return [startIndex, endIndex]
  }

  findRelevantLines = (
    activeDoc: vscode.TextDocument,
    classNameSyntaxId: RegExp,
  ): MatchedLine[] => {
    const lines = []
    const { lineCount } = activeDoc
    for (let line = 0; line < lineCount; line++) {
      let lineText = activeDoc.lineAt(line).text
      const matches = lineText.matchAll(classNameSyntaxId)
      if (!matches) {
        continue
      }
      for (let match of matches) {
        lines.push({ line, match })
      }
    }
    return lines
  }

  findRelevantChars = (
    { line, match }: MatchedLine,
    classNameSyntaxId: RegExp,
  ): vscode.Range[] => {
    if (line === undefined) {
      return []
    }
    const ranges: vscode.Range[] = []
    const { index, input } = match
    if (index === undefined || input === undefined) {
      return ranges
    }
    const endOfClassNameSyntaxId = index + String(classNameSyntaxId).length - 3
    const indicesOfQuotes:
      | StringRangeIndices
      | undefined = this.getIndicesOfQuotes(endOfClassNameSyntaxId, input)
    if (!indicesOfQuotes) {
      return ranges
    }
    const classList = input.substring(...indicesOfQuotes)
    const classNamesIndices: StringRangeIndices[] = this.getIndividualClassNameIndices(
      indicesOfQuotes,
      classList,
    )
    classNamesIndices.map(([start, end]) => {
      ranges.push(
        new vscode.Range(
          new vscode.Position(line, start),
          new vscode.Position(line, end),
        ),
      )
    })

    return ranges
  }
}
