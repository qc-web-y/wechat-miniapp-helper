const { readFile, writeFileSync, existsSync, mkdir } = require('fs')
const { join, extname, basename } = require('path')
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

async function change (event, type) {

  // 获取小程序文件Root路径
  const rootPath = vscode.workspace.rootPath
  const miniRoot = (await readWorkspaceFile('project.config.json')).data.miniprogramRoot
  const miniPath = join(rootPath, miniRoot)

  // 获取变化文件在app.json pages 中配置路径
  const fsPath = type === 'delete' ? event.files[0].fsPath : event.files[0].oldUri.fsPath
  const pageDir = join(fsPath).replaceAll(miniPath, '').replaceAll('\\', '/')
  const pageName = basename(pageDir)
  const pagePath = pageDir + '/' + pageName

  // 检测变化文件是否在 app.json pages 中
  const appFile = await readWorkspaceFile('app.json')
  const existFilePath = appFile.data.pages.some(s => s === pagePath)
  if(!existFilePath) return

  // 同步删除文件至 app.json pages 中
  function syncDeleteFile () {
    appFile.data.pages = appFile.data.pages.filter(s => s !== pagePath)
    writeFileSync(appFile.path, JSON.stringify(appFile.data, null, '\t'))
  }

  // 同步重命名文件修改
  function syncRenameFile () {
    const newUri = event.files[0].newUri
    const newPageDir = join(newUri.fsPath).replaceAll(miniPath, '').replaceAll('\\', '/')
    const newPageName = basename(newPageDir)
    const newPagePath = newPageDir + '/' + newPageName

    // 同步 app.json
    appFile.data.pages = appFile.data.pages.map(s => (s === pagePath) ? newPagePath : s)
    writeFileSync(appFile.path, JSON.stringify(appFile.data, null, '\t'))

    // 重命名其子文件名
    vscode.workspace.fs.readDirectory(newUri).then(childs => {
      childs.forEach(s => {
        const sourceUri = vscode.Uri.file(join(newUri.fsPath, s[0]))
        const targetUri = vscode.Uri.file(join(newUri.fsPath, newPageName + extname(s[0])))
        vscode.workspace.fs.rename(sourceUri, targetUri, {overwrite: true})
      })
    })
  }

  // 用户开启自动同步配置后执行
  const isAutoSync =  vscode.workspace.getConfiguration('wechat-miniapp').get(`sync.${type}`)
  if(isAutoSync) {
    if (type === 'delete') syncDeleteFile()
    if (type === 'rename') syncRenameFile()
    return
  }

  // 用户未开启自动同步需询问
  let msgType = (type === 'delete') ? '删除' : '重命名'
  vscode.window.showInformationMessage(`检测到${msgType}文件为小程序页面，是否同步至app.json？`, '是', '否')
    .then(result => {
      if(result === '否') return
      if (type === 'delete') syncDeleteFile()
      if (type === 'rename') syncRenameFile()
    })
}

module.exports = {
  handle,
  change
}
