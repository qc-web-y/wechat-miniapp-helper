# 微信小程序助手

## Features

- 目前只有一个功能，快速新建`page`和`component`文件结构，自动追加`page`路径到`app.json`

> 后续**也许**会添加其他功能

## Usage

右键点击**文件夹**或者**空白处**才会出现`WeChat: 新建 Page`和`WeChat: 新建 Component`选项

![Capture](https://raw.githubusercontent.com/whosydd/images-in-one/main/202108280127446.PNG)

> 如果通过命令使用该扩展，那么默认会在项目根目录创建文件夹

## Extension Settings

### wechat-miniapp-create.PageGist

在`settings`添加该配置后，可以通过在[Gist](https://gist.github.com/)上添加自定义的文件模板，通过`ajax`获取到本地

注意：`filename`必须包含后缀

> 另外你可以在浏览器地址栏得到`gistID`
>
> https://gist.github.com/whosydd/037f52d91c0dcd5a8d81d68c2fb3c754 <-- 后面这一长串数字就是`gistID`

```json
"wechat-miniapp-create.PageGist": {
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

### wechat-miniapp-create.ComponentGist

配置同上

-----------------------------------------------------------------------------------------------------------

<div>Icons made by <a href="https://www.freepik.com" title="Freepik">Freepik</a> from <a href="https://www.flaticon.com/" title="Flaticon">www.flaticon.com</a></div>

