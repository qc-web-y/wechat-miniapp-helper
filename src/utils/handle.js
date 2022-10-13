const { readFile, writeFileSync, existsSync, mkdir, rmdir } = require('fs')
const { join } = require('path')
const vscode = require('vscode')
const axios = require('axios')

function readWorkspaceFile (fileName) {
  return new Promise(async (resolve) => {
    const res = (fileName === 'app.json')
    ? await vscode.workspace.findFiles('**/app.json', '**/node_modules/**')
    : await vscode.workspace.findFiles(`**/${fileName}`)

    if (res.length === 0) throw `${fileName} 文件不存在!`

    const filePath = res[0].fsPath
    readFile(filePath, (err, data) => resolve({path: filePath, data:JSON.parse(data)}))
  })
}

function ajax (fileName, gistID) {
  return new Promise(resolve => {
    axios
      .get('https://api.github.com/gists/' + gistID)
      .then(({ data } = {}) => resolve(data.files[`${fileName}`].content))
      .catch(err => vscode.window.showErrorMessage(err.message))
  })
}

function getPluginSetting (type) {
  // 新旧配置名兼容，前新，后旧
  const settingsName = 'wechat-miniapp' || 'wechat-miniapp-create'
  const styleExtName = 'ext.style' || 'Style'
  const gistPageName = 'gist.page' || 'PageGist'
  const gistCompName = 'gist.component' || 'ComponentGist'

  // 获取VSCode 插件配置
  const settings = vscode.workspace.getConfiguration(settingsName)
  const { wxml, wxss, json, js } = settings.get(type ?  gistPageName : gistCompName)
  const styleExt = settings.get(styleExtName)
  const scriptExt = settings.get('ext.script')

  return {wxml, wxss, json, js, styleExt, scriptExt}
}

async function handle(folder, JSON_DEF, JS_DEF, type) {
  const { wxml, wxss, json, js, styleExt, scriptExt } = getPluginSetting()

  const rootPath = vscode.workspace.rootPath
  const miniRoot = (await readWorkspaceFile('project.config.json')).data.miniprogramRoot

  // 获取目标文件夹名称
  const input = await vscode.window.showInputBox({
    placeHolder: `请输入新建${type ? '页面' : '组件'}名`
  })

  // 获取目标文件路径
  const target = join(folder.fsPath, '/', input)

  // 获取文件名
  const fileName = join(folder.fsPath, `${input}/${input}`)
  // eslint-disable-next-line no-unused-vars
  const [_, filePath] = fileName.split(rootPath)
  const newPath = filePath.replaceAll('\\', '/').slice(1).replace(miniRoot, '')

  try {
    // 检测新建文件是否存在
    if (existsSync(target)) throw '目标文件已存在！'

    // 新建页面时自动将路径添加至 "app.json"
    if (type === 'PAGE') {
      const appFile = await readWorkspaceFile('app.json')
      appFile.data.pages.push(newPath)
      writeFileSync(appFile.path, JSON.stringify(appFile.data, null, '\t'))
    }

    // 模板准备wxml
    const wxmlStr = (wxml.fileName && wxml.gistID)
    ? await ajax(wxml.fileName, wxml.gistID)
    : `<!--${newPath}.wxml-->\n<text>${newPath}.wxml</text>`

    // 模板准备wxss
    const wxssStr = (wxss.fileName && wxss.gistID)
    ? await ajax(wxss.fileName, wxss.gistID)
    : `/* ${newPath}.${styleExt} */`

    // 模板准备json
    const jsonStr = (json.fileName && json.gistID)
    ? await ajax(json.fileName, json.gistID)
    : JSON_DEF

    // 模板准备js
    const jsStr = (js.fileName && js.gistID)
    ? await ajax(js.fileName, js.gistID)
    : `// ${newPath}.${scriptExt}${JS_DEF}`

    mkdir(target, () => {
      // 写入wxml
      const wxmlTarFile = join(target, `/${input}.wxml`)
      writeFileSync(wxmlTarFile, wxmlStr, 'utf-8')

      // 写入wxss
      const wxssTarFile = join(target, `/${input}.${styleExt}`)
      writeFileSync(wxssTarFile, wxssStr, 'utf-8')

      // 写入json
      const jsonTarFile = join(target, `/${input}.json`)
      writeFileSync(jsonTarFile, jsonStr, 'utf-8')

      // 写入js
      const jsTarFile = join(target, `/${input}.${scriptExt}`)
      writeFileSync(jsTarFile, jsStr, 'utf-8')
    })
  } catch (err) {
    vscode.window.showErrorMessage(err)
  }
}

async function handleDelete (folder) {
  // 获取小程序文件Root路径
  const rootPath = vscode.workspace.rootPath
  const miniRoot = (await readWorkspaceFile('project.config.json')).data.miniprogramRoot
  const miniPath = join(rootPath, miniRoot)

  // 获取该删除文件在app.json pages 中的路径
  const filePath = join(folder.fsPath).replaceAll(miniPath, '').replaceAll('\\', '/')
  const appPagePath = filePath + filePath.substr(filePath.lastIndexOf('/'), filePath.length + 1)

  // 检测该删除文件是否在 pp.json pages 中
  const appFile = await readWorkspaceFile('app.json')
  const existFilePath = appFile.data.pages.some(s => s === appPagePath)

  if(existFilePath) {
    vscode.window.showInformationMessage('确定要删除该文件吗？', '是', '否')
      .then(result => {
        if(result === '是') {
          vscode.workspace.fs.delete(folder, {recursive: true})
          appFile.data.pages = appFile.data.pages.filter(s => s !== appPagePath)
          writeFileSync(appFile.path, JSON.stringify(appFile.data, null, '\t'))
        }
      })
  } else {
    vscode.window.showErrorMessage('该文件并不在 app.json 中！')
  }
}

module.exports = {
  handle,
  handleDelete
}
