const { readFile, writeFileSync, existsSync, mkdir } = require('fs')
const { join } = require('path')
const vscode = require('vscode')
const axios = require('axios')

async function handle(folder, config, JSON_DEF, JS_DEF, type) {
  const { wxml, wxss, json, js } = config
  let wxmlStr, wxssStr, jsonStr, jsStr

  const rootPath = vscode.workspace.workspaceFolders[0].uri.fsPath
  if (folder === undefined) folder = rootPath

  // 获取目标文件夹名称
  const input = await vscode.window.showInputBox({
    placeHolder: `请输入${type ? '页面' : '组件'}名称`,
  })

  // 获取目标文件路径
  const target = join(folder.fsPath, '/', input)

  // 获取文件名
  const fileName = join(folder.fsPath, `${input}/${input}`)
  const [_, filePath] = fileName.split(rootPath)
  const newPath = filePath.replaceAll('\\', '/').slice(1)

  // ajax
  function ajax(fileName, gistID) {
    return new Promise(resolve => {
      axios
        .get('https://api.github.com/gists/' + gistID)
        .then(res => {
          const str = res.data.files[`${fileName}`].content
          resolve(str)
        })
        .catch(err => {
          vscode.window.showErrorMessage(err.message)
        })
    })
  }

  try {
    // 判断是否已存在文件
    if (existsSync(target)) throw '目标文件已存在！'

    if (wxml.fileName && wxml.gistID) wxmlStr = await ajax(wxml.fileName, wxml.gistID)
    else wxmlStr = `<!--${newPath}.wxml-->\n<text>${newPath}.wxml</text>`

    if (wxss.fileName && wxss.gistID) wxssStr = await ajax(wxss.fileName, wxss.gistID)
    else wxssStr = `/* ${newPath}.wxss */`

    if (json.fileName && json.gistID) jsonStr = await ajax(json.fileName, json.gistID)
    else jsonStr = JSON_DEF

    if (js.fileName && js.gistID) jsStr = await ajax(js.fileName, js.gistID)
    else jsStr = `// ${newPath}.js${JS_DEF}`

    // 写入wxml
    const wxmlTarFile = join(target, `/${input}.wxml`)
    mkdir(target, () => writeFileSync(wxmlTarFile, wxmlStr, 'utf-8'))

    // 写入wxss
    const wxssTarFile = join(target, `/${input}.wxss`)
    writeFileSync(wxssTarFile, wxssStr, 'utf-8')

    // 写入json
    const jsonTarFile = join(target, `/${input}.json`)
    writeFileSync(jsonTarFile, jsonStr, 'utf-8')

    // 写入js
    const jsTarFile = join(target, `/${input}.js`)
    writeFileSync(jsTarFile, jsStr, 'utf-8')

    if (type === 'PAGE') {
      // 添加路径到 app.json
      const file = join(rootPath, 'app.json')
      console.log(file)
      if (!existsSync(file)) throw '根目录不存在app.json文件!'
      readFile(file, (err, data) => {
        if (err) return console.log(err)
        const app = JSON.parse(data)
        app.pages.unshift(newPath)
        writeFileSync(file, JSON.stringify(app, null, '\t'))
      })
    }
  } catch (err) {
    console.log('err', err)
    vscode.window.showErrorMessage(err)
  }
}

module.exports = {
  handle,
}
