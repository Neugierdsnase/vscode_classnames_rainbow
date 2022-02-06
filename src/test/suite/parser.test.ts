import * as assert from 'assert'
import * as path from 'path'
import * as vscode from 'vscode'
import * as myExtension from '../../extension'
import { Parser } from '../../parser'
import { Utility } from '../../utility'

const MOCK_DIRECTORY = '../../../src/test/suite/mocks'
const utility = new Utility()

suite('Parser Test Suite', () => {
  vscode.window.showInformationMessage('Start all tests.')

  test('getIndicesOfQuotes', () => {
    const parser = new Parser(utility)
    assert.deepStrictEqual(
      parser.getIndicesOfQuotes(0, `"these are some mock class names"`),
      [1, 32],
    )
    assert.deepStrictEqual(
      parser.getIndicesOfQuotes(0, `={"these are some mock class names"}`),
      [3, 34],
    )
  })

  test('findeRelevantLines', async () => {
    const parser = new Parser(utility)
    const htmlUri = vscode.Uri.file(
      path.join(__dirname, MOCK_DIRECTORY, 'mock.html'),
    )
    const activeHtmlDoc = await vscode.workspace.openTextDocument(htmlUri)
    const htmlMatchLines = parser
      .findRelevantLines(activeHtmlDoc, /class=/g)
      .map(({ line }) => line)
    assert.deepStrictEqual(htmlMatchLines, [10, 12, 13])

    const tsxUri = vscode.Uri.file(
      path.join(__dirname, MOCK_DIRECTORY, 'mock.tsx'),
    )
    const activeTsxDoc = await vscode.workspace.openTextDocument(tsxUri)
    const tsxMatchLines = parser
      .findRelevantLines(activeTsxDoc, /className=/g)
      .map(({ line }) => line)
    assert.deepStrictEqual(tsxMatchLines, [10, 15, 22])
  })

  test('findRelevantChars', async () => {
    const parser = new Parser(utility)
    const htmlUri = vscode.Uri.file(
      path.join(__dirname, MOCK_DIRECTORY, 'mock.html'),
    )
    const activeHtmlDoc = await vscode.workspace.openTextDocument(htmlUri)
    const htmlFirstMatchLine = parser.findRelevantLines(
      activeHtmlDoc,
      /class=/g,
    )[0]
    const relevantHTMLChars = parser.findRelevantChars(
      htmlFirstMatchLine,
      /class=/g,
    )[0]
    const rangeFromFirstHtmlMatch = new vscode.Range(
      new vscode.Position(htmlFirstMatchLine.line, 13),
      new vscode.Position(htmlFirstMatchLine.line, 14),
    )
    assert.deepStrictEqual(relevantHTMLChars, rangeFromFirstHtmlMatch)

    const tsxUri = vscode.Uri.file(
      path.join(__dirname, MOCK_DIRECTORY, 'mock.tsx'),
    )
    const activeTsxDoc = await vscode.workspace.openTextDocument(tsxUri)
    const tsxFirstMatchLine = parser.findRelevantLines(
      activeTsxDoc,
      /className=/g,
    )[0]
    const relevantTsxChars = parser.findRelevantChars(
      tsxFirstMatchLine,
      /className=/g,
    )[0]
    const rangeFromFirstTsxMatch = new vscode.Range(
      new vscode.Position(tsxFirstMatchLine.line, 25),
      new vscode.Position(tsxFirstMatchLine.line, 26),
    )
    assert.deepStrictEqual(relevantTsxChars, rangeFromFirstTsxMatch)
  })
})
