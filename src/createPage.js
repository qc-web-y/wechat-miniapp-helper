const PAGE_JSON_STR = require('./template/page/PAGE_JSON_STR')
const PAGE_JS_STR = require('./template/page/PAGE_JS_STR')
const { handle } = require('./utils/handle')

async function createPage(folder) {
  handle(folder, PAGE_JSON_STR, PAGE_JS_STR, 'PAGE')
}

module.exports = {
  createPage
}
