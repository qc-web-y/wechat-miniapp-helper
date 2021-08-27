const vscode = require('vscode')
const PAGE_JSON_STR = require('./template/page/PAGE_JSON_STR')
const PAGE_JS_STR = require('./template/page/PAGE_JS_STR')
const { handle } = require('./utils/handle')

async function createPage(folder) {
  const gist = vscode.workspace.getConfiguration('wechat-miniapp-create').get('PageGist')

  handle(folder, gist, PAGE_JSON_STR, PAGE_JS_STR, 'PAGE')
}

module.exports = {
  createPage,
}
