// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import { type } from 'os'
import * as vscode from 'vscode'

type MatchedLine = { line: number; match: RegExpMatchArray }
type StringRangeIndices = [number, number]

const BRIGHTNESS_SETTING = vscode.workspace
  .getConfiguration('classnamesRainbow')
  .get('colorbrightness') as number
const lintResults = new Map()
const dialectMap: Record<string, RegExp> = {
  html: /class=/g,
  javascriptreact: /className=/g,
  typescriptreact: /className=/g,
  svelte: /class=/g,
  vue: /class=/g,
  astro: /class=/g,
}

const getSmallerValue = (val1?: number, val2?: number) => {
  if (val1 === undefined || val1 === -1) {
    return val2
  }
  if (val2 === undefined || val2 === -1) {
    return val1
  }
  return val1 < val2 ? val1 : val2
}

const dynamicallyGenerateColor = (index: number): vscode.ThemeColor => {
  const multipliedIndex = index * 20
  const hue = multipliedIndex > 254 ? multipliedIndex - 254 : multipliedIndex
  const saturation = BRIGHTNESS_SETTING * 5 + 25
  const lightness = BRIGHTNESS_SETTING * 3 + 15
  const alpha = BRIGHTNESS_SETTING * 0.05 + 0.25
  return `hsl(${hue}, ${saturation}%, ${lightness}%, 0.5)`
}

const getIndicesOfQuotes = (
  startLookingAt: number,
  text: string,
): StringRangeIndices | undefined => {
  const relevantString = text.slice(startLookingAt)
  const startIndex =
    (getSmallerValue(
      relevantString.indexOf('"'),
      relevantString.indexOf("'"),
    ) || 0) +
    startLookingAt +
    1
  if (startIndex < startLookingAt) {
    return
  }
  const stringAfterStart = text.slice(startIndex + 1)
  const endIndex =
    (getSmallerValue(
      stringAfterStart.indexOf('"'),
      stringAfterStart.indexOf("'"),
    ) || 0) +
    startIndex +
    1
  if (endIndex === startIndex) {
    return
  }

  return [startIndex, endIndex]
}

const findRelevantLines = (
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

const getIndividualClassNameIndices = (
  [classListStart]: StringRangeIndices,
  classList: string,
): StringRangeIndices[] => {
  const classNameIndices = classList
    .split(' ')
    .map((className) => {
      if (className === '') {
        return undefined
      }
      const classNameStart = classListStart + classList.indexOf(className)
      const classNameEnd = classNameStart + className.length
      return [classNameStart, classNameEnd]
    })
    .filter(Boolean) as StringRangeIndices[]

  return classNameIndices
}

const findRelevantChars = (
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
  const indicesOfQuotes: StringRangeIndices | undefined = getIndicesOfQuotes(
    endOfClassNameSyntaxId,
    input,
  )
  if (!indicesOfQuotes) {
    return ranges
  }
  const classList = input.substring(...indicesOfQuotes)
  const classNamesIndices: StringRangeIndices[] = getIndividualClassNameIndices(
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

const autoHighlightclassNames = (activeDoc: vscode.TextDocument) => {
  try {
    const classNameSyntaxId = dialectMap[activeDoc.languageId]
    const lines = findRelevantLines(activeDoc, classNameSyntaxId)
    const editor = getActiveEditor()
    let classNameHighlights: vscode.DocumentHighlight[] = []
    for (let line of lines) {
      const ranges = findRelevantChars(line, classNameSyntaxId)
      for (let range of ranges) {
        editor?.document.validateRange(range)
        classNameHighlights.push(new vscode.DocumentHighlight(range))
      }
    }
    classNameHighlights.map((classNameHighlight, index) => {
      const decoration = vscode.window.createTextEditorDecorationType({
        backgroundColor: dynamicallyGenerateColor(index),
      })
      editor?.setDecorations(decoration, [classNameHighlight])
    })
    return 'Done'
  } catch (error) {
    console.error(error)
    return 'Error'
  }
}

const getActiveEditor = () => {
  const activeWindow = vscode.window
  if (!activeWindow) {
    return
  }
  return activeWindow.activeTextEditor ?? undefined
}

const getActiveDoc = (activeEditor?: vscode.TextEditor) => {
  if (!activeEditor) {
    activeEditor = getActiveEditor()
  }
  if (!activeEditor) {
    return
  }
  return activeEditor.document ?? undefined
}

const classNamesLint = (activeDoc?: vscode.TextDocument) => {
  if (!activeDoc) {
    activeDoc = getActiveDoc()
  }
  if (!activeDoc) {
    return
  }
  const filePath = activeDoc.fileName // For new unitled scratch documents this would be "Untitled-1", "Untitled-2", etc...
  if (!filePath) {
    return
  }
  const originalLanguageId = activeDoc.languageId
  console.log('originalLanguageId: ', originalLanguageId)
  if (!dialectMap.hasOwnProperty(originalLanguageId)) {
    return
  }
  const lintCacheKey = `${filePath}${originalLanguageId}`
  lintResults.set(lintCacheKey, 'Processing...')
  const lintReport = autoHighlightclassNames(activeDoc)
  lintResults.set(lintCacheKey, lintReport)
  return lintReport
}

const classNamesLintCmd = () => {
  classNamesLint()
}

const handleDocOpen = (activeDoc: vscode.TextDocument) => {
  classNamesLint(activeDoc)
}

const handleEditorSwitch = (editor: vscode.TextEditor) => {
  let activeDoc = getActiveDoc(editor)
  classNamesLint(activeDoc)
}

const handleDocEdit = (changeEvent: vscode.TextDocumentChangeEvent) => {
  if (!changeEvent) {
    return
  }
  let activeDoc = changeEvent.document
  if (!activeDoc) {
    return
  }
  classNamesLint(activeDoc)
}

export function activate(context: vscode.ExtensionContext) {
  // Use the console to output diagnostic information (console.log) and errors (console.error)
  // This line of code will only be executed once when your extension is activated
  console.log(
    'Congratulations, your extension "classNames-rainbow" is now active!',
  )

  // The command has been defined in the package.json file
  // Now provide the implementation of the command with registerCommand
  // The commandId parameter must match the command field in package.json
  const lintCmd = vscode.commands.registerCommand(
    'classNames-rainbow.lint',
    classNamesLintCmd,
  )

  const docOpenEvent = vscode.workspace.onDidOpenTextDocument(handleDocOpen)
  const switchEvent = vscode.window.onDidChangeActiveTextEditor(
    (editor) => editor && handleEditorSwitch(editor),
  )
  const docEditEvent = vscode.workspace.onDidChangeTextDocument((event) =>
    handleDocEdit(event),
  )

  context.subscriptions.push(lintCmd)
  context.subscriptions.push(docOpenEvent)
  context.subscriptions.push(docEditEvent)
  context.subscriptions.push(switchEvent)

  setTimeout(function () {
    // Need this because "onDidOpenTextDocument()" doesn't get called for the first open document.
    // Another issue is when dev debug logging mode is enabled, the first document would be "Log" because it is printing something and gets VSCode focus.
    const activeDoc = getActiveDoc()
    activeDoc && handleDocOpen(activeDoc)
  }, 1000)
}

// this method is called when your extension is deactivated
export function deactivate() {}
