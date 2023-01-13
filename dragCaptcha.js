export {Utils, DragCaptcha}

/**
 * This file is part of drag-captcha.
 *
 * Licensed under The MIT License
 *
 * @author rlofls
 */
let Lang = {
    'zh': {
        'move': '拖拽图标到目标位置',
        'success': '验证成功',
        'fail': '验证失败'
    },
    'en': {
        'move': 'Drag mask to the target',
        'success': 'verify successfully',
        'fail': 'verify failed'
    }
}


let Utils = {
    appendChildren: function(parent, ...children) {
        children.forEach((c) => parent.appendChild(c))
    },
    doActionByClass: function(className, cb = null) {
        let e = document.getElementsByClassName(className).item(0);
        if (e instanceof Element && cb) {
            cb(e)
        }
        return e;
    },
    setStyles: function(node, valObj) {
        Object.keys(valObj).forEach((k) => {
            node.style[k] = valObj[k]
        });
    },
    setAttrs: function(node, valObj) {
        Object.keys(valObj).forEach((k) => {
            node.setAttribute(k, valObj[k])
        });
    },
    createElement: function(tagName, attrs = {}, styles = {}) {
        let e = document.createElement(tagName)
        Utils.setAttrs(e, attrs)
        Utils.setStyles(e, styles)
        return e
    },
    createSvg: function (attrs = {}, styles = {}) {
        let svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
        Utils.setAttrs(svg, attrs)
        Utils.setStyles(svg, styles)
        return svg
    },
    createPath: function (attrs = {}, styles = {}) {
        let path = document.createElementNS('http://www.w3.org/2000/svg', 'path')
        Utils.setAttrs(path, attrs)
        Utils.setStyles(path, styles)
        return path
    },
    createIcon: function(svg, path) {
        let s = Utils.createSvg(svg.attrs, svg.styles);
        let p = Utils.createPath(path.attrs, svg.styles);
        s.appendChild(p)
        return s
    },
    request: function(method, url, data = null, successFunc = null, errorFunc = null) {
        let xhr = new XMLHttpRequest();
        xhr.open(method, url, true);
        xhr.responseType = 'json';
        xhr.setRequestHeader('Content-Type', 'application/json');
        xhr.onreadystatechange = function(){
            if (xhr.readyState === 4){
                if (xhr.status === 200){
                    if (successFunc && successFunc instanceof Function) {
                        successFunc(xhr.response);
                    }
                } else {
                    if (errorFunc && errorFunc instanceof Function) {
                        errorFunc(xhr.status);
                    }
                }
            }
        };
        xhr.onerror = function (e) {
            if (errorFunc && errorFunc instanceof Function) {
                errorFunc(e);
            }
        };
        xhr.send(data)

    },

    bind: function(obj, func)
	{
		return function()
		{
			return func.apply(obj, arguments);
		};
	},
}

/**
 * 
 * @param {Element} btn 
 * @param {String} lang 
 */
function DragCaptcha(btn) {
    this.btn = btn
    this.init();
    this.initEventListener();

    this.addClickEventListener();
   
}

/**
 * 语言 zh:中文 en: 英文
 */
DragCaptcha.prototype.lang = 'zh'

/**
 * 开始调式 会打印日志
 */
DragCaptcha.prototype.debug = true

/**
 * 验证码根 node
 */
DragCaptcha.prototype.rootNode = null

/**
 * 一次验证 事务 id
 */
DragCaptcha.prototype.cid = ''

/**
 * 验证码 获取数据接口 url get
 * api 返回数据格式 json 
 * {
 *      "status": "success"  // error 表示失败
 *      "data": {
 *         "bgBase64: "...",
 *         'bgW': 200,
 *         'bgH': 160,
 *         'maskBase64': "...",
 *         'maskPath': "...",
 *         'maskLeft': 10,
 *         'maskTop': 100,
 *         'maskViewBox': 15.875,
 *         'maskWH': 60
 *      }
 * }
 */
DragCaptcha.prototype.apiDataUrl = '/dragData'

/**
 * 验证码 进行验证接口 url post
 * api 返回数据格式 json 
 * {
 *      "status": "success"   // error 表示失败
 * }
 */
DragCaptcha.prototype.apiVerifyUrl = '/dragVerify'

/**
 * 验证码进行验证 成功 回调函数
 */
DragCaptcha.prototype.cbSuccess = null

/**
 * 验证码进行验证 失败 回调函数
 */
DragCaptcha.prototype.cbFail = null


DragCaptcha.prototype.call = function (cb, ...args) {
    if (cb instanceof Function) {
        cb(this, args);
    }
}

DragCaptcha.prototype.addClickEventListener = function() {
    this.btn.addEventListener('click', this.eventClickListener);
}

/**
 * 渲染验证码
 */
DragCaptcha.prototype.render = function() {
    let that = this

    Utils.request('GET', that.apiDataUrl, null, function(response) {
        if (response.status && response.status == 'success') {
            that.cid = response.data.cid
            that.log('cid:', that.cid)
            that.showAni(response.data)
            that.log("render complete")
            return
        }
        that.log('render 失败', response)
    }, function(error) {
        that.log('render 失败', error)
    })
}

/**
 * 验证
 */
DragCaptcha.prototype.verify = function(data) {
    this.log('verify', data)
    let that = this

    let postData = {
        cid: this.cid,
        mask: data
    }
    Utils.request('POST', this.apiVerifyUrl, JSON.stringify(postData), function(response) {
        if (response.status && response.status == 'success') {
            that.aniVerifySuccess()
            setTimeout(() => {
                that.log('verify success', response)
                that.close();
                that.btn.removeEventListener('click', that.eventClickListener)
                that.call(that.cbSuccess)
            }, 1000)
            return;
        } 
        that.aniVerifyFail()
        setTimeout(() => {
            that.log("verify 失败")
            that.call(that.cbFail)
    
            that.render()
        }, 1000)

    }, function (error) {
        that.aniVerifyFail()
        setTimeout(() => {
            that.log("verify 失败", error)
            that.call(that.cbFail)
    
            that.render()
        }, 1000)
        
    })
}

DragCaptcha.prototype.pathClose = 'M 0.8152883,3.8174125 A 2.168649,2.168649 0 0 1 1.5133233,0.83183563 2.168649,2.168649 0 0 1 4.4992823,1.5282345 2.168649,2.168649 0 0 1 3.8045197,4.5145746 2.168649,2.168649 0 0 1 0.81779934,3.8214486 M 3.2991312,2.0071143 C 1.9825694,3.3246797 1.9787213,3.3285308 1.9787213,3.3285308 m -2.886e-4,-1.317938 c 1.3165617,1.3175655 1.3204098,1.3214166 1.3204098,1.3214166'
DragCaptcha.prototype.pathRefresh = 'M 4.5838557,1.8853027 H 3.4135916 M 4.6032021,0.71263702 V 1.882927 M 4.4200613,1.7607213 A 2.0031751,1.9692227 3.8521096 0 0 2.4349437,0.73989014 2.0031751,1.9692227 3.8521096 0 0 0.73109426,2.1629366 2.0031751,1.9692227 3.8521096 0 0 1.4358413,4.2531269 2.0031751,1.9692227 3.8521096 0 0 3.6692781,4.4007701'

/**
 * 初始化 验证码 elements
 */
DragCaptcha.prototype.init = function () {
    this.log("drag capthca init")

    if (this.rootNode instanceof Element) {
        this.rootNode.parentNode.removeChild(this.rootNode)
    }

    this.rootNode = Utils.createElement('div', {
        "id": "dc-captcha",
        "class": "dc-captcha"
    })

    let content = Utils.createElement('div', {"class": "dc-content"})
    
    let title = Utils.createElement('div', {"class": "dc-title"})
    title.innerHTML = Lang[this.lang]['move']
    
    let body = Utils.createElement('div', {"class": "dc-body"})
    let bodyBg = Utils.createElement('img', {"class": "dc-body-bg"}) 
    let bodyMask = Utils.createElement('img', {"class": "dc-body-mask"}) 
    let bodyMaskSvg = Utils.createIcon({attrs: {"class": "dc-body-mask-svg"}, styles: {}}, {attrs: {"class": "dc-body-mask-path"}, styles: {}})
    let bodyTip = Utils.createElement('div', {"class": "dc-body-tip"})
    Utils.appendChildren(body, bodyBg, bodyMask, bodyMaskSvg, bodyTip)

    let action = Utils.createElement('div', {"class": "dc-action"})
    let svg = {
        attrs: {
            'draggable': 'false',
            'viewBox': '0 0 5.2916665 5.2916666',
            'class': 'dc-icon'
        },
        styles: {
            'width': '23px',
            'height': '23px',
        }
    }
    let actionClose = Utils.createIcon(svg, {attrs: { d: this.pathClose}, styles: {}})
    let actionRefresh = Utils.createIcon(svg, {attrs: { d: this.pathRefresh}, styles: {}})
    Utils.appendChildren(action, actionClose, actionRefresh)

    Utils.appendChildren(content, title, body, action)
    this.rootNode.appendChild(content)

    document.body.appendChild(this.rootNode)

    actionClose.addEventListener('click', Utils.bind(this, this.close))
    actionRefresh.addEventListener('click', Utils.bind(this, this.render))
}

/**
 * 初始化 事件 cb
 */
DragCaptcha.prototype.initEventListener = function () {
    this.eventClickListener = Utils.bind(this, this.render)
    this.eventMaskDownListener = Utils.bind(this, this.maskMouseDown)
    this.eventMaskMoveListener = Utils.bind(this, this.maskMouseMove)
    this.eventMaskUpListener = Utils.bind(this, this.maskMouseUp)
}


DragCaptcha.prototype.bgW = 200
DragCaptcha.prototype.bgH = 160

/**
 * 重置验证码
 * data: 
 */
DragCaptcha.prototype.reset = function({
    bgBase64,
    bgW = 200,
    bgH = 160,
    maskBase64,
    maskPath,
    maskLeft,
    maskTop,
    maskViewBox = 15.875,
    maskWH = 60 }) {

    this.bgW = bgW
    this.bgH = bgH
    this.maskWH = maskWH
    this.maskLeft = maskLeft
    this.maskTop = maskTop

    this.log("dc reset")
    Utils.doActionByClass('dc-body', e => {
        Utils.setStyles(e, {
            'width': bgW + 'px',
            'height': bgH + 'px'
        });
    })
    Utils.doActionByClass('dc-body-bg', e => {
        Utils.setStyles(e, {
            'width': bgW + 'px',
            'height': bgH + 'px'
        });
        Utils.setAttrs(e, {'src': bgBase64 });
    })
    Utils.doActionByClass('dc-body-mask', e => {
        Utils.setStyles(e, {
            'width': maskWH + 'px',
            'height': maskWH + 'px',
            'left': maskLeft + 'px',
            'top': maskTop + 'px'
        });
        Utils.setAttrs(e, {'src': maskBase64});
    })
    Utils.doActionByClass('dc-body-mask-path', e => {
        Utils.setAttrs(e, {'d': maskPath})
    })
    Utils.doActionByClass('dc-body-mask-svg', e => {
        e.style.removeProperty('stroke')
        e.style.removeProperty('transform')
        Utils.setAttrs(e, {'viewBox': '0 0 ' + maskViewBox + ' ' + maskViewBox});
        Utils.setStyles(e, {
            'width': maskWH + 'px',
            'height': maskWH + 'px',
            'left': maskLeft + 'px',
            'top': maskTop + 'px'
        });
    })

    Utils.doActionByClass('dc-content', e => e.classList.remove('dc-ani-shake'))
    Utils.doActionByClass('dc-body-tip', e => {
        e.classList.remove('dc-ani-success-tip')
        e.classList.remove('dc-ani-fail-tip')
    })
    

    this.addMaskListeners()
}

DragCaptcha.prototype.maskMouseDown = function(evt) {
    this.log('drag down')
    this.isDraging = true
    
    //moveEvent
    if (evt instanceof TouchEvent) {
        let touch = evt.touches.item(0)
        this.moveX = touch.clientX
        this.moveY = touch.clientY
    }

    this.log('drag down end')
    Utils.doActionByClass('dc-body-mask-svg', e => {
        e.style.transform = 'scale(1.1)'
        e.style.opacity = '0.5'
    })
}

/**
 * 
 * @param {} evt 
 */
DragCaptcha.prototype.getMoveOffset = function(evt) {

   

    if (evt instanceof MouseEvent) {
        return {offsetX: evt.movementX, offsetY: evt.movementY}
    }

    if (evt instanceof TouchEvent) {
        let touch = evt.touches.item(0)
        let x = touch.clientX - this.moveX
        let y = touch.clientY - this.moveY
        this.moveX = touch.clientX
        this.moveY = touch.clientY
        return {offsetX: x, offsetY: y}
    }
}

DragCaptcha.prototype.maskMouseMove = function(evt) {
    if (! this.isDraging) {
        return;
    }

    let maskSvg = Utils.doActionByClass('dc-body-mask-svg')
    let mask = Utils.doActionByClass('dc-body-mask')

    let {offsetX, offsetY} = this.getMoveOffset(evt)
    let oriL = parseInt(mask.style.left);
    let abLeft =  (isNaN(oriL) ? this.maskLeft : oriL) + offsetX

    let oriT = parseInt(mask.style.top);
    let abTop = (isNaN(oriT) ? this.maskTop : oriT) + offsetY

    let dstL = abLeft + 'px';
    let dstT = abTop + 'px';

    let clt = - this.maskWH / 2;
    let cr = this.bgW - this.maskWH / 2;
    let cb = this.bgH - this.maskWH / 2
    if (abLeft < clt) {
        dstL = clt + 'px';
    }
    if (abLeft > cr) {
        dstL = cr + 'px';
    }
    if (abTop < clt) {
        dstT = clt + 'px';
    }
    if (abTop > cb) {
        dstT = cb + 'px';
    }

    let pos = {
        'left': dstL,
        'top': dstT
    };
    Utils.setStyles(mask, pos);
    Utils.setStyles(maskSvg, pos);
}

DragCaptcha.prototype.maskMouseUp = function(evy) {

    this.log('drag up')
    if (! this.isDraging) {
        return;
    }
    this.isDraging = false

    let maskSvg = Utils.doActionByClass('dc-body-mask-svg', e => {
        //e.style.stroke = "DarkSlateGray"
        e.style.transform = 'scale(1.1)'
        e.style.opacity = '1'
        
    })

    let l = parseInt(maskSvg.style.left)
    let t = parseInt(maskSvg.style.top)
    this.verify({
        'left': l,
        'top': t
    });

    this.removeMaskListeners();
}

DragCaptcha.prototype.addMaskListeners = function () {
    Utils.doActionByClass('dc-body-mask', e => {
        e.addEventListener('mousedown', this.eventMaskDownListener)
        e.addEventListener('mousemove', this.eventMaskMoveListener)
        e.addEventListener('mouseup', this.eventMaskUpListener)
        e.addEventListener('mouseleave', this.eventMaskUpListener)

        e.addEventListener('touchstart', this.eventMaskDownListener)
        e.addEventListener('touchmove', this.eventMaskMoveListener)
        e.addEventListener('touchend', this.eventMaskUpListener)
    })
}

DragCaptcha.prototype.removeMaskListeners = function () {
    Utils.doActionByClass('dc-body-mask', e => {
        e.removeEventListener('mousedown', this.eventMaskDownListener)
        e.removeEventListener('mousemove', this.eventMaskMoveListener)
        e.removeEventListener('mouseup', this.eventMaskUpListener)
        e.removeEventListener('mouseleave', this.eventMaskUpListener)

        e.removeEventListener('touchstart', this.eventMaskDownListener)
        e.removeEventListener('touchmove', this.eventMaskMoveListener)
        e.removeEventListener('touchend', this.eventMaskUpListener)
    })
}

/**
 * 显示 验证码
 */
DragCaptcha.prototype.show = function() {
    
    this.log("dc show")
    Utils.doActionByClass('dc-captcha', e => {
        e.classList.remove("dc-ani-close")
        e.classList.add("dc-ani-open")
        e.style.display = "grid"
    })
}

DragCaptcha.prototype.hasShowAni = false

/**
 * 显示动画
 */
DragCaptcha.prototype.showAni = function(data) {

    this.hasShowAni && this.aniLeftHide()

    let that = this
    setTimeout(() => {
        that.reset(data)
        that.show()
        that.hasShowAni && that.aniRightShow()
        if (that.hasShowAni == false) { that.hasShowAni = true }
    }, this.hasShowAni ? 600 : 0);
}

DragCaptcha.prototype.aniVerifySuccess = function () {
    let that = this
    Utils.doActionByClass('dc-body-tip', e => {
        e.innerHTML = Lang[that.lang].success
        e.classList.add('dc-ani-success-tip')
    })
    Utils.doActionByClass('dc-body-mask-svg', e => e.style.stroke = "#4eee53")
}

DragCaptcha.prototype.aniVerifyFail = function () {
    let that = this
    Utils.doActionByClass('dc-content', e => {
        e.classList.add('dc-ani-shake')
    })
    Utils.doActionByClass('dc-body-tip', e => {
        e.innerHTML = Lang[that.lang].fail
        e.classList.add('dc-ani-fail-tip')
    })
    Utils.doActionByClass('dc-body-mask-svg', e => e.style.stroke = "#f44336")
}

DragCaptcha.prototype.aniLeftHide = function() {
    let remove = e => {
        e.classList.remove('dc-ani-right-show')
        e.classList.remove('dc-ani-text-show')

        e.classList.add("dc-ani-left-hide")
    }
    Utils.doActionByClass('dc-title', remove)
    Utils.doActionByClass('dc-body', remove)
}

DragCaptcha.prototype.aniRightShow = function() {
    Utils.doActionByClass('dc-title', e => {
        e.classList.remove("dc-ani-left-hide")
        e.classList.add('dc-ani-text-show')
    })
    Utils.doActionByClass('dc-body', e => {
        e.classList.remove("dc-ani-left-hide")
        e.classList.add('dc-ani-right-show')
    })
}



/**
 * 关闭验证码
 */
DragCaptcha.prototype.close = function() {
    this.log('dc close')
    Utils.doActionByClass('dc-captcha', e => {
        e.classList.remove("dc-ani-open")
        e.style.backgroundColor = "#00000000"
        e.classList.add("dc-ani-close")
        setTimeout(() => {
            e.style.display = "none"
        }, 500);
    })
}

/**
 * 日志打印
 */
DragCaptcha.prototype.log = function (...args) {
    if (this.debug) {
        console.log(args);
    }
}
