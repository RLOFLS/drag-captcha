# Drag-Captcha

拖拽图形验证，简单易用, 只需要绑定按钮即可使用。 [english](./README-en.md)\
`composer require rlofls/drag-captcha`

![show](./docs/drag-zh.png)
![示例](./docs/drag-zh.gif)

- [功能介绍](#features)
  - [自定义背景](#custom-bg)
  - [开启干扰混淆](#confuse)
- [运行示例](#run-demo)
- [实践](#practice)
- [api](#api)
## <a id="features">功能介绍</a>

### <a id="custom-bg">自定义背景</a>

  先设置 `Resources::$customBg` 数组值，一定要是 **png** 图片， 存放的是图片路径。 eg:

  ```php
  //设置自定义背景
  Resources::$customBg = [
    __DIR__ . '/customBg/1.png',
    __DIR__ . '/customBg/2.png',
    __DIR__ . '/customBg/3.png',
    //...
  ];
  ```

### <a id="confuse">添加干扰混淆</a>

  能够使目标不那么明显，会随机对目标进行扩展/剪切，在调用 `generate()` 方法时候， 传入`true` 值即可。 eg: `$drag->generate(true);`

- expand:

  ![expand](./docs/confuse-expand.png)
- cut

  ![expand](./docs/confuse-cut.png)
  
## <a id="run-demo">运行示例</a>

1. 切换到此目录下
2. `composer install`
3. `php -S 127.0.0.1:8087`
4. 浏览器访问 `http://127.0.0.1:8087`

## <a id="practice">实践</a>

参考 `index.php` `index.html`\
复制 `dragCaptcha.css` `dragCaptcha.js` 到自己项目应用 \
参考 html
```html
<body>
    
    <button id="show">show</button>
</body>
<script type="module">
    import {DragCaptcha} from "./dragCaptcha.js";
    //设置要绑定的按钮
    let btn = document.getElementById("show")

    //1.设置 请求数据api 地址， 默认： /dragData
    //DragCaptcha.prototype.apiDataUrl = '/dragData'
    //2.设置 请求验证api 地址， 默认： /dragVerify
    //DragCaptcha.prototype.apiVerifyUrl = '/dragVerify'

    //3.设置语言 默认 zh：中文， en:英文
    //DragCaptcha.prototype.lang = 'en'

    //4.设置debug  默认 true 会打印日志
    //DragCaptcha.prototype.debug = false

    //5.设置验证成功 callback
    DragCaptcha.prototype.cbSuccess = function(drag) {
        console.log("验证通过 cid:", drag.cid)
        //处理自己业务逻辑 提交表单 ...

        //如果业务逻辑失败。需要重新添加点击事件, 因为在验证成功时候会取消点击事件
        //console.log("业务逻辑失败，重新绑定点击事件")
        //drag.addClickEventListener()
    }
    //6. 设置验证失败 callback
    DragCaptcha.prototype.cbFail = function(drag) {
        console.log("验证失败")
    }
    let drag = new DragCaptcha(btn);

</script>

```

## <a id="api">api</a>

- `Rlofls\DragCaptcha\Drag`
  - `generate` 生成渲染数据 `dst, data`
  - `verify` 验证匹配结果

- 服务器api 要求， Content-Type: application/json
  - `/dragData`---[GET]---获取验证码数据\
    响应数据格式:
    ```json
    {
      "status": "success" // error 表示失败
      "data": {
        //一次验证 事务id 用户自己生成
        "cid": "drag-captcha63c0c18566074"
        //以下数据由 Rlofls\DragCaptcha\Drag::generate 生成
        "bgBase64": "data:image/png;base64,iV..."
        "bgH": 160
        "bgW": 250
        "maskBase64": "data:image/png;base64,..."
        "maskLeft": 114
        "maskPath": "M 15.27429..."
        "maskTop": 0
        "maskViewBox": 15.875
        "maskWH": 57
      }

    }
    ```
  - `/dragVerify`---[POST]---进行验证码验证\
    请求参数
    ```json
    {
      "cid": "drag-captcha63c0c1881db17"
      "mask": {
        "left": 149, 
        "top": 76
      }
    }
    ```
    响应数据格式:
    ```json
    {"status": "error"}
    ```
    
## todo

- 欢迎提交 `issuse`
