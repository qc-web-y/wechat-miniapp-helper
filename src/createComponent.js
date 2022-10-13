const COMPONENT_JSON_STR = require('./template/component/COMPONENT_JSON_STR')
const COMPONENT_JS_STR = require('./template/component/COMPONENT_JS_STR')
const { handle } = require('./utils/handle')

async function createComponent(folder) {
  handle(folder, COMPONENT_JSON_STR, COMPONENT_JS_STR)
}

module.exports = {
  createComponent
}
