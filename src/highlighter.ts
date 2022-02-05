import * as vscode from 'vscode'
import { dialectMap } from './constants';
import { Parser } from './parser';
import { Utility } from "./utility";

export class Highlighter {
  decorationsArray: vscode.DecorationRenderOptions[];
  
  constructor(private readonly utility: Utility, private readonly parser: Parser) {
    this.decorationsArray = []
  }

  private getHiglightsFromDoc = () => {
    const activeDoc = this.utility.getActiveDoc()
    if (!activeDoc) {return}
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
      return classNameHighlights
    } catch (error) {
      console.error(error)
      return false
    }
  }

  dynamicallyCreateDecorationTypes = (highlights: vscode.DocumentHighlight[]) => {
    const decorations: vscode.DecorationRenderOptions[] = []
    highlights.map((_, index) => {
      decorations.push({
        backgroundColor: this.utility.dynamicallyGenerateColor(index),
      })
    })
    this.decorationsArray = decorations
  }
  
  applyHighlights = () => {
    const editor = this.utility.getActiveEditor()
    const highlights = this.getHiglightsFromDoc()
    if (!highlights) {return}
    editor?.setDecorations(vscode.window.createTextEditorDecorationType(this.decorationsArray[0]), [highlights])
  }
}