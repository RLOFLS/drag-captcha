export {Drag, Utils}

/**
 * This file is part of drag-captcha.
 *
 * Licensed under The MIT License
 *
 * @author rlofls
 */

/**
 * Drag Captcha
 * @param {*} container 
 * @param {*} lang 
 */
function Drag(container, lang = 'zh') {

    this.container = container;
    //elements
    this.node = null;
    this.bgImg = null;
    this.maskImg = null;
    this.maskSvg = null;
    this.note = null;

    //language
    this.lang = lang;

    //Whether to trigger click and drag
    this.isDraging = false;
};

Drag.prototype.matchFunc = function ($mask) {
    //User implementation
}

/**
 * Render and display drag and drop validation graphics
 * @param {"bgBase64: "...",
 *         'bgW': 200,
 *         'bgH': 160,
 *         'maskBase64': "...",
 *         'maskPath': "...",
 *         'maskLeft': 10,
 *         'maskTop': 100,
 *         'maskViewBox': 15.875,
 *         'maskWH': 60 } $data 
 */
Drag.prototype.render = function ({
    bgBase64,
    bgW = 200,
    bgH = 160,
    maskBase64,
    maskPath,
    maskLeft,
    maskTop,
    maskViewBox = 15.875,
    maskWH = 60 }) {

    if (this.node) {
        this.destroy();
    }
        
    this.createRootNode();
    this.createdBgImg(bgW, bgH, bgBase64);
    this.createMaskImg(maskWH, maskLeft, maskTop, maskBase64);
    let viewBox = "0 0 " + maskViewBox + " " + maskViewBox;
    this.createMaskSvg(maskWH, maskLeft, maskTop, viewBox, maskPath);
    this.createNote();

    this.bgW = bgW;
    this.bgH = bgH;
    this.maskWH = maskWH;
    this.maskLeft = maskLeft;
    this.maskTop = maskTop;

    this.addMaskListeners();

    this.node.style.removeProperty('display');
};

/**
 * Update matching success style
 */
Drag.prototype.matchSuccess = function () {
    if (this.maskSvg && this.note) {
        this.maskSvg.style.stroke = "SpringGreen";
        this.note.innerHTML = Lang[this.lang]['success'];
        this.note.style.backgroundColor = "LimeGreen";
        this.note.style.color = "LightYellow";
    }
}

/**
 * Update matching fail style
 */
Drag.prototype.matchFail = function () {
    if (this.maskSvg && this.note) {
        this.maskSvg.style.stroke = "OrangeRed"
        this.note.innerHTML = Lang[this.lang]['fail']
        this.note.style.backgroundColor = "Red"
        this.note.style.color = "LightYellow"
    }
}

/**
 * destroy drag verify
 */
Drag.prototype.destroy = function () {
    if (this.node) {
        this.node.parentNode.removeChild(this.node)
    }

    //elements
    this.node = null;
    this.bgImg = null;
    this.maskImg = null;
    this.maskSvg = null;
    this.note = null;

    this.isDraging = false;

}

Drag.prototype.createRootNode = function() {
    this.node = document.createElement('div');
    this.node.setAttribute('id', 'drag-verify-root');
    Utils.setStyles(this.node, {'display': 'none'})

    this.container.appendChild(this.node)
}

Drag.prototype.createdBgImg = function(width, height, data) {
    this.bgImg = document.createElement('img');
    Utils.setStyles(this.bgImg, {
        'width': width + 'px',
        'height': height + 'px'
    });
    Utils.setAttrs(this.bgImg, {
        'id': 'drag-verify-bg',
        'draggable': 'false',
        'src': data
    });

    this.node.appendChild(this.bgImg);

}

Drag.prototype.createMaskImg = function(wh, left, top, data) {
    this.maskImg = document.createElement('img');
    Utils.setStyles(this.maskImg, {
        'width': wh + 'px',
        'height': wh + 'px',
        'left': left + 'px',
        'top': top + 'px'
    });
    Utils.setAttrs(this.maskImg, {
        'id': 'drag-verify-mask',
        'draggable': 'false',
        'src': data
    });
    this.node.appendChild(this.maskImg);
}
Drag.prototype.maskMouseDown = function(evt) {
    this.isDraging = true
}

Drag.prototype.maskMouseMove = function(evt) {
    if (! this.isDraging) {
        return;
    }
    this.maskSvg.style.stroke =  "LightYellow"

    let oriL = parseInt(this.maskImg.style.left);
    let abLeft =  (isNaN(oriL) ? this.maskLeft : oriL) + evt.movementX

    let oriT = parseInt(this.maskImg.style.top);
    let abTop = (isNaN(oriT) ? this.maskTop : oriT) + evt.movementY

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
    Utils.setStyles(this.maskImg, pos);
    Utils.setStyles(this.maskSvg, pos);
}

Drag.prototype.maskMouseUp = function(evy) {
    if (! this.isDraging) {
        return;
    }
    this.isDraging = false
    this.maskSvg.style.stroke = "DarkSlateGray"

    let l = parseInt(this.maskImg.style.left)
    let t = parseInt(this.maskImg.style.top)
    this.matchFunc({
        'left': l,
        'top': t
    });

    this.removeMaskListeners();
}

Drag.prototype.addMaskListeners = function () {
    this.maskImg.addEventListener('mousedown', Utils.bind(this, this.maskMouseDown), {once: true})
    this.maskImg.addEventListener('mousemove', Utils.bind(this, this.maskMouseMove))
    this.maskImg.addEventListener('mouseup', Utils.bind(this, this.maskMouseUp), {once: true})
    this.maskImg.addEventListener('mouseleave', Utils.bind(this, this.maskMouseUp), {once: true})
}

Drag.prototype.removeMaskListeners = function () {
    this.maskImg.removeEventListener('mousemove', Utils.bind(this, this.maskMouseMove))
}

Drag.prototype.createMaskSvg = function(wh, left, top, viewBox, path) {
    this.maskSvg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    let svgPath = document.createElementNS('http://www.w3.org/2000/svg', 'path');

    svgPath.setAttribute('d', path);

    Utils.setAttrs(this.maskSvg, {
        'id': 'drag-verify-path',
        'draggable': 'false',
        'viewBox': viewBox
    });
    Utils.setStyles(this.maskSvg, {
        'width': wh + 'px',
        'height': wh + 'px',
        'left': left + 'px',
        'top': top + 'px'
    });
    

    this.maskSvg.appendChild(svgPath);
    this.node.appendChild(this.maskSvg);
}

Drag.prototype.createNote = function() {
    this.note = document.createElement('div');
    Utils.setAttrs(this.note, {
        'id': 'drag-verify-note'
    });

    this.note.innerHTML = Lang[this.lang]['move'];

    this.node.appendChild(this.note);
}

let Lang = {
    'zh': {
        'move': '拖拽图标到目标位置',
        'success': '匹配成功',
        'fail': '匹配失败'
    },
    'en': {
        'move': 'Drag mask to the target',
        'success': 'match successfully',
        'fail': 'match failed'
    }
}


let Utils = {

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