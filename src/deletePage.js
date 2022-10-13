const { handleDelete } = require('./utils/handle')

async function deletePage(folder) {
  handleDelete(folder)
}

module.exports = {
  deletePage
}
