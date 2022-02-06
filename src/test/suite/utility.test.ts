import * as assert from 'assert'
import * as vscode from 'vscode'
import * as myExtension from '../../extension'
import { Utility } from '../../utility'

suite('Utility Test Suite', () => {
  vscode.window.showInformationMessage(
    'Start dynamicallyGenerateColor test suite',
  )

  test('generates colors correctly', () => {
    const utility = new Utility()
    assert.strictEqual(
      utility.dynamicallyGenerateColor(1, 1),
      `hsl(20, 30%, 18%, 0.47)`,
    )
    assert.strictEqual(
      utility.dynamicallyGenerateColor(4, 7),
      `hsl(80, 60%, 36%, 0.59)`,
    )
  })

  test('getsmallestValue', () => {
    const utility = new Utility()
    assert.strictEqual(utility.getSmallestValue([-1, -1, 5]), 5)
    assert.strictEqual(utility.getSmallestValue([-1, 3, 5]), 3)
    assert.strictEqual(utility.getSmallestValue([7, 9, 2]), 2)
  })
})
