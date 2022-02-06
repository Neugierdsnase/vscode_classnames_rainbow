import * as vscode from 'vscode'
import { dialectMap } from './constants'
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
      return
    }
    try {
      const classNameSyntaxId = dialectMap[activeDoc.languageId]
      const lines = this.parser.findRelevantLines(activeDoc, classNameSyntaxId)
      let classNameHighlights: vscode.DocumentHighlight[] = []
      for (let line of lines) {
        const ranges = this.parser.findRelevantChars(line, classNameSyntaxId)
        for (let range of ranges) {
          classNameHighlights.push(new vscode.DocumentHighlight(range))
        }
      }
      this.classNameHighlights = classNameHighlights
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
    console.log('this.decorationsArray: ', this.decorationsArray)
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
