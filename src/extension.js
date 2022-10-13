const vscode = require('vscode')
const { createComponent } = require('./createComponent')
const { createPage } = require('./createPage')
const { deletePage } = require('./deletePage')

/**
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {
  let page = vscode.commands.registerCommand('createPage', createPage)
  let delPage = vscode.commands.registerCommand('deletePage', deletePage)
  let component = vscode.commands.registerCommand('createComponent', createComponent)

  context.subscriptions.push(page, component, delPage)
}

// this method is called when your extension is deactivated
function deactivate() {}

module.exports = {
  activate,
  deactivate,
}
