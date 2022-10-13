# 微信小程序助手

- 该扩展为 `微信小程序助手的Fork -whosydd`, 如需原版请至 [wechat-miniapp-helper](https://marketplace.visualstudio.com/items?itemName=whosydd.wechat-miniapp-helper)
- 快速创建小程序页面 `page` 文件结构，并同步 `app.json` 中的对应页面路径
- 快速创建小程序页面 `component` 文件结构
- 支持通过vscode配置修改文件结构扩展名以支持 `sass` `typescript` 及自定义模板
- 当删除/重命名 `page` 文件时，可自动/手动进行 `app.json` 及对应子文件的同步

## Usage

右键点击**文件夹**或者**空白处**可在右键菜单中显示
中文版：
- `微信小程序: 新建页面`
- `微信小程序: 新建组件`

英文版
- `WeChat: New Page`
- `WeChat: New Component`

![Capture](https://raw.githubusercontent.com/whosydd/images-in-one/main/202108280127446.PNG)

## Extension Settings

#### wechat-miniapp.sync.delete

设置删除小程序页面时，是否自动同步 `app.json` `pages` 路径配置，默认为 `false`

```json
"wechat-miniapp.sync.delete": true,
```

#### wechat-miniapp.sync.rename

设置重命名小程序页面时，是否自动同步 `app.json` `pages` 路径配置，及其子文件名，默认为 `false`

```json
"wechat-miniapp.sync.delete": true,
```

#### wechat-miniapp.ext.style

设置小程序页面 `wxss` 样式文件的扩展名，当前仅支持 `wxss(default) | less | sass | scss`

```json
"wechat-miniapp.ext.style": "scss",
```

#### wechat-miniapp.ext.script

设置小程序页面 `js` 脚本文件的扩展名，当前仅支持 `js(default) | ts`

```json
"wechat-miniapp.ext.script": "ts",
```

#### wechat-miniapp.gist.page

在`settings`添加该配置后，可以通过在[Gist](https://gist.github.com/)上添加自定义的文件模板，通过`ajax`获取到本地

注意：`filename`必须包含后缀

> 另外你可以在浏览器地址栏得到`gistID`
>
> https://gist.github.com/whosydd/037f52d91c0dcd5a8d81d68c2fb3c754 <-- 后面这一长串数字就是`gistID`

```json
"wechat-miniapp.gist.page": {
    "wxml": {
      "fileName": "test.wxml",
      "gistID": "79f6deafa782a06739d96a01b047479a"
    },
    "wxss": {
      "fileName": "",
      "gistID": ""
    },
    "json": {
      "fileName": "",
      "gistID": ""
    },
    "js": {
      "fileName": "",
      "gistID": ""
    }
  },
```

### wechat-miniapp.gist.component

配置同上

---

<div>Icons made by <a href="https://www.freepik.com" title="Freepik">Freepik</a> from <a href="https://www.flaticon.com/" title="Flaticon">www.flaticon.com</a></div>
