// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode'
import { Highlighter } from './highlighter'
import { Parser } from './parser'
import { Utility } from './utility'

const classNamesLint = (
  utility: Utility,
  highlighter: Highlighter,
  activeDoc?: vscode.TextDocument,
) => {
  if (!activeDoc) {
    activeDoc = utility.getActiveDoc()
  }
  if (!activeDoc) {
    return
  }
  const filePath = activeDoc.fileName
  if (!filePath) {
    return
  }
  return highlighter.applyHighlights()
}

const handleDocOpen = (
  activeDoc: vscode.TextDocument,
  utility: Utility,
  highlighter: Highlighter,
) => {
  classNamesLint(utility, highlighter, activeDoc)
}

const handleEditorSwitch = (
  editor: vscode.TextEditor,
  utility: Utility,
  highlighter: Highlighter,
) => {
  const activeDoc = utility.getActiveDoc(editor)
  classNamesLint(utility, highlighter, activeDoc)
}

const handleDocEdit = (
  changeEvent: vscode.TextDocumentChangeEvent,
  utility: Utility,
  highlighter: Highlighter,
) => {
  if (!changeEvent) {
    return
  }
  let activeDoc = utility.getActiveDoc()
  if (!activeDoc) {
    return
  }
  highlighter.clearAllHighlights()
  classNamesLint(utility, highlighter, activeDoc)
}

export function activate(context: vscode.ExtensionContext) {
  // Use the console to output diagnostic information (console.log) and errors (console.error)
  // This line of code will only be executed once when your extension is activated
  console.log('The classNames-rainbow"-extension is now active.')
  const utility = new Utility()
  const highlighter = new Highlighter(utility, new Parser(utility))

  const docOpenEvent = vscode.workspace.onDidOpenTextDocument((activeDoc) =>
    handleDocOpen(activeDoc, utility, highlighter),
  )
  const switchEvent = vscode.window.onDidChangeActiveTextEditor(
    (editor) => editor && handleEditorSwitch(editor, utility, highlighter),
  )
  const docEditEvent = vscode.workspace.onDidChangeTextDocument((event) =>
    handleDocEdit(event, utility, highlighter),
  )

  context.subscriptions.push(docOpenEvent)
  context.subscriptions.push(docEditEvent)
  context.subscriptions.push(switchEvent)

  setTimeout(function () {
    // Need this because "onDidOpenTextDocument()" doesn't get called for the first open document.
    // Another issue is when dev debug logging mode is enabled, the first document would be "Log" because it is printing something and gets VSCode focus.
    const activeDoc = utility.getActiveDoc()
    activeDoc && handleDocOpen(activeDoc, utility, highlighter)
  }, 1000)
}

// this method is called when your extension is deactivated
export function deactivate() {}
