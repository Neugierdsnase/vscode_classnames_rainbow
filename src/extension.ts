// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode'
import { dialectMap } from './constants'
import { Highlighter } from './highlighter'
import { Parser } from './parser'
import { Utility } from './utility'

const utility = new Utility()

const classNamesLint = (activeDoc?: vscode.TextDocument) => {
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
  const originalLanguageId = activeDoc.languageId
  if (!dialectMap.hasOwnProperty(originalLanguageId)) {
    return
  }
  return new Highlighter(utility, new Parser(utility)).applyHighlights()
}

const classNamesLintCmd = () => {
  classNamesLint()
}

const handleDocOpen = (activeDoc: vscode.TextDocument) => {
  classNamesLint(activeDoc)
}

const handleEditorSwitch = (editor: vscode.TextEditor) => {
  const activeDoc = utility.getActiveDoc(editor)
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
    'The classNames-rainbow"-extension is now active.',
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
    const activeDoc = utility.getActiveDoc()
    activeDoc && handleDocOpen(activeDoc)
  }, 1000)
}

// this method is called when your extension is deactivated
export function deactivate() {}
