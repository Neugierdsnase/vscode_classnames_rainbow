import * as vscode from 'vscode'
import { CLASSNAME_REGEX } from './constants'
import { Parser } from './parser'
import { Utility } from './utility'

export class Highlighter {
  decorationsArray: vscode.TextEditorDecorationType[]
  classNameHighlights: vscode.DocumentHighlight[]

  constructor(
    private readonly utility: Utility,
    private readonly parser: Parser,
  ) {
    this.decorationsArray = []
    this.classNameHighlights = []
  }

  private getHiglightsFromDoc = () => {
    const activeDoc = this.utility.getActiveDoc()
    if (!activeDoc) {
      console.log('No active doc!')
      return
    }
    try {
      const ranges: vscode.Range[] = []
      const text = activeDoc.getText()
      let matches = text.matchAll(CLASSNAME_REGEX)

      for (let match of matches) {
        if (match.index) {
          ranges.push(
            new vscode.Range(
              activeDoc.positionAt(match.index),
              activeDoc.positionAt(match.index + match[0].length),
            ),
          )
        }
      }

      this.classNameHighlights = ranges.map(
        (range) => new vscode.DocumentHighlight(range),
      )
    } catch (error) {
      console.error(error)
      return false
    }
  }

  dynamicallyCreateDecorationTypes = (
    highlights: vscode.DocumentHighlight[],
  ) => {
    const decorations: vscode.TextEditorDecorationType[] = []
    highlights.map((_, index) => {
      decorations.push(
        vscode.window.createTextEditorDecorationType({
          backgroundColor: this.utility.dynamicallyGenerateColor(index),
        }),
      )
    })
    this.decorationsArray = decorations
  }

  private clearExistingHighlights = () => {
    this.classNameHighlights = []
  }

  private clearExistingDecorations = () => {
    this.decorationsArray.map((deco) => deco.dispose())
    this.decorationsArray = [vscode.window.createTextEditorDecorationType({})]
  }

  clearAllHighlights = () => {
    const editor = this.utility.getActiveEditor()
    if (!editor) {
      return
    }
    this.clearExistingHighlights()
    this.clearExistingDecorations()
    editor.setDecorations(this.decorationsArray[0], this.classNameHighlights)
  }

  applyHighlights = () => {
    const editor = this.utility.getActiveEditor()
    if (!editor) {
      return
    }
    this.getHiglightsFromDoc()
    if (!this.classNameHighlights) {
      return
    }
    this.dynamicallyCreateDecorationTypes(this.classNameHighlights)
    this.decorationsArray.map((decoration, index) => {
      editor.setDecorations(decoration, [this.classNameHighlights[index]])
    })
  }
}
