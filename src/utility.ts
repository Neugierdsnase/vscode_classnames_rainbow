import * as vscode from 'vscode'

export class Utility {
  colorIntensitySetting: number
  constructor () {
    this.colorIntensitySetting = vscode.workspace
    .getConfiguration('classnamesRainbow')
    .get('colorIntensity') as number
  }

  getSmallestValue = (values: number[]) => {
    const filteredValues = values.filter((val) => val >= 0)
    if (!filteredValues.length) { return 0 }
    return Math.min(...filteredValues)
  }

  dynamicallyGenerateColor = (index: number, brightnessSetting: number = this.colorIntensitySetting): vscode.ThemeColor => {
    const multipliedIndex = index * 20
    const hue = multipliedIndex > 254 ? multipliedIndex - 254 : multipliedIndex
    const saturation = (brightnessSetting * 5) + 25
    const lightness = (brightnessSetting * 3) + 15
    const alpha = Math.round(((brightnessSetting * 0.02) + 0.45) * 100) / 100
    return `hsl(${hue}, ${saturation}%, ${lightness}%, ${alpha})`
  }

  getActiveEditor = () => {
    const activeWindow = vscode.window
    if (!activeWindow) {
      return
    }
    return activeWindow.activeTextEditor ?? undefined
  }
  
  getActiveDoc = (activeEditor?: vscode.TextEditor) => {
    if (!activeEditor) {
      activeEditor = this.getActiveEditor()
    }
    if (!activeEditor) {
      return
    }
    return activeEditor.document ?? undefined
  }
}