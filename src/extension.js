const vscode = require("vscode");
const { createComponent } = require("./createComponent");
const { createPage } = require("./createPage");

/**
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {
  let page = vscode.commands.registerCommand("createPage", createPage);
  let component = vscode.commands.registerCommand(
    "createComponent",
    createComponent
  );

  context.subscriptions.push(page, component);
}

// this method is called when your extension is deactivated
function deactivate() {}

module.exports = {
  activate,
  deactivate,
};
