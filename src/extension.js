const vscode = require('vscode')
const { createComponent } = require('./createComponent')
const { createPage } = require('./createPage')
const { change } = require('./utils/handle')

/**
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {
  let page = vscode.commands.registerCommand('createPage', createPage)
  let component = vscode.commands.registerCommand('createComponent', createComponent)
  let onDeleteFile = vscode.workspace.onDidDeleteFiles(e => change(e, 'delete'))
  let onRenameFile = vscode.workspace.onDidRenameFiles(e => change(e, 'rename'))

  context.subscriptions.push(page, component, onDeleteFile, onRenameFile)
}

// this method is called when your extension is deactivated
function deactivate() {}

module.exports = {
  activate,
  deactivate,
}
