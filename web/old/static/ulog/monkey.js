/**
 * ulog - speed
 * @version 1.0
 * @copyright uaq.baidu.com
 *
 * @file uaq用户行为分析
 * @author 赵志鑫(ZhaoZhiXin,zhaozhixin@baidu.com)
 */
(function (window, document, ulog, undefined) {
    var tracker = ulog("monkey.track"), 
        //编码对象
        eleHashObj, 
        htmlEl = document.documentElement, 
        bodyEl = document.body, 
        //点击次数
        count = 0, 
        //页面尺寸信息
        vr = 0, 
        unloaded = false;
    //抽样率
    if(Math.random() > tracker.get("sample")) {
        return;
    }
    var userConfig = {
        //指定自定义链接
        ulogAction : 'ulog-action',
        //指定节点名称
        ulogName : 'ulog-name',
        //指定文本
        ulogText : 'ulog-text',
        //指定点击流的范围，支持传入element, id
        ulogApp : null,
        //是否只统计link (是否允许自动以链接)
        onlylink : false,
        //统计页面停留时间
        staytime : true
    }
    //获取元素尺寸
    function getPageSize(element) {
        var BoundingClientRect = element.getBoundingClientRect();
        return [
            parseInt(BoundingClientRect.right - BoundingClientRect.left), 
            parseInt(BoundingClientRect.bottom - BoundingClientRect.top)
        ]
    }
    //获取最大网页尺寸
    function getMaxPageSize() {
        var htmlSize = getPageSize(htmlEl),
        bodySize = getPageSize(bodyEl);
        return [
            Math.max(htmlSize[0], bodySize[0], window.innerWidth || 0, htmlEl.scrollWidth || 0), 
            Math.max(htmlSize[1], bodySize[1], window.innerHeight || 0, htmlEl.scrollHeight || 0)
        ]
    }
    //获取元素滚动条信息
    function getMaxScrollSize(key) {
        key = key || "|";
        return [
            Math.max(htmlEl.scrollLeft || 0, bodyEl.scrollLeft || 0, document.defaultView && document.defaultView.pageXOffset || 0), 
            Math.max(htmlEl.scrollTop || 0, bodyEl.scrollTop || 0, document.defaultView && document.defaultView.pageYOffset || 0), 
            window.innerWidth || htmlEl.clientWidth || bodyEl.clientWidth || 0, 
            window.innerHeight || htmlEl.clientHeight || bodyEl.clientHeight || 0
        ].join(key)
    }
    //寻找链接
    function findLink(target) {
        for (; target;) {
            if (/^(a|button)$/i.test(target.tagName)) return target;
            target = target.parentNode
        }
    }
    //获取用户配置属性
    //支持对className做正则匹配
    //支持“#” ，“.”，抓取元素id,class
    //支持抓取自定义属性[attrName]
    //都不匹配的情况下直接返回抓取的type值
    //支持向上查找，找到匹配为止
    function getUserAttr(node, type, deep) {
        if (!node || 1 != node.nodeType) return "";
        var res;
        //判断是否一个正则表达式
        if (/^\/.*\/$/.test(type)) {
            //对className执行正则表达式
            var regResult = new RegExp(type.replace(/^\/|\/$/g, "")).exec(node.className);
            res = regResult && regResult[1];
        } else {
            //尝试去拿属性
            res = ("undefined" != typeof node.getAttribute) && node.getAttribute && node.getAttribute(type) || "";
            //id选择器
            if("#" == res) {
                res = "[id]"
            } else {
                //class选择器
                if("." == res) {
                    res = "[class]"
                }
            }
            //匹配属性
            res.replace(/\[([\w-_]+)\]/, function(e, attr) {
                //抓取id或者class属性
                res = node.getAttribute(attr);
            })
        } 
        return res || deep && getUserAttr(node.parentNode, type, 1) || ""
        
    }
    //获取一个元素的父路径
    function getXPath(element, parentEl) {
        initEleHash();
        parentEl = parentEl || bodyEl;
        //如果是body则放弃获取
        if (!element || element == parentEl || /^body$/i.test(element.tagName)) {
            return "";
        }
        //如果是html则放弃获取
        if (1 != element.nodeType || /^html$/i.test(element.tagName)) {
            return element.tagName || "";
        } 
        var alias = getUserAttr(element, userConfig.ulogName), 
            index = 1, 
            prevElement = element.previousSibling, 
            element_nodeName = element.nodeName.toLowerCase();
        //判断是同级的第几个元素
        for (; prevElement;) {
            index = index + (prevElement.nodeName == element.nodeName);
            prevElement = prevElement.previousSibling;
        }
        alias = (eleHashObj[element_nodeName] || element_nodeName) + (2 > index ? "": index) + (alias && "(" + alias + ")")
        return element.parentNode == parentEl ? alias: (getXPath(element.parentNode, parentEl) + (/^[A-Z]/.test(alias) ? "": "-") + alias)
    }
    //初始化编码策略
    function initEleHash() {
        //eleHashObj = {"A":"div","B":"li"}这种形式
        if(!eleHashObj) {
            eleHashObj = {};
        }
        if(eleHashObj["_inited"]) {
            return;
        }
        eleHashObj["_inited"] = true;
        "AdivBliCaDulEdlFddGspanHtableIbodyJtrKsectionLtdMolNpOarticlePdtQformRimgSh3TinputUasideViWbXthYemZfont"
        .replace(/([A-Z])([a-z0-9]+)/g, function(e, key, eleName) {
            eleHashObj[eleName] = key;
        })
    }
    
    function getEp(element, position, n) {
        function i(e, t) {
            return String((~~ (e / n) * n / t).toFixed(3)).replace(/^0\./g, ".")
        }
        n = n || 7;
        var oldBoundingClientRect = element.getBoundingClientRect(),
        elementSize = getPageSize(element);
        return [i(position[0] - oldBoundingClientRect.left, elementSize[0]), i(position[1] - oldBoundingClientRect.top, elementSize[1])]
    }
    function handleEvent(event, type) {
        var target = event.target || event.srcElement;
        var reportData;
        switch(type) {
            //所有点击类的解决方案
            case "d":
                reportData = handleClick(target, event);
                tracker.report(null, reportData);
                break;
            //浏览器滚动
            case "s":
            //变化尺寸
            case "r":
                vr = getMaxScrollSize("|");
                break;
        }
    }
    //link是默认监听的,
    //也可以自定义action
    //通过userConfig.onlylink来判断是否支持自定义action
    function handleClick(target, event) {
        if (!target) {
            return;
        }
        var emptyObj = {},
        link = findLink(target),
        //获取自定义的链接
        action = getUserAttr(target, userConfig.ulogAction);
        href = "",
        text = getUserAttr(target, userConfig.ulogText);
        //如果元素是一个连接，就尝试去拿url和text
        if (link) {
            if(/^a$/i.test(link.tagName)) {
                href = link.getAttribute("href", 2);
                if(/^(javascript|#)/i.test(href)) {
                    href = "";
                }
            }
            //优先去拿ulogText字段，然后加title，然后才是去拿innerHTML
            text = text || getUserAttr(link, userConfig.ulogText) || link.title || link.innerHTML.replace(/<[^>]*>|\s/g, "");
        } else {
            //如果元素是一个按钮
            if(/input/i.test(target.tagName) && /button|radio|checkbox|submit/i.test(target.type)) {
                link = target;
                text = text || target.value;
            }
        }
        if (!link && !action) {
            return;
        } 
        if (userConfig.onlylink && /input|button/i.test(target.tagName)) {
            return;
        }
        //找到当前元素的路径
        var xp = getXPath(target),
        //获取点击的是元素的哪个位置
        ep = getEp(target, [event.clientX, event.clientY]),
        ownerDoc = target.ownerDocument,
        _body = ownerDoc.body,
        point = [0, 0];
        if(event.pageX || event.pageY) {
            point = [event.pageX, event.pageY];
        } else {
            if(event.clientX || event.clientY) {
                var scrollLeft = (ownerDoc && ownerDoc["scrollLeft"]) || (_body && _body["scrollLeft"]) || 0;
                var clientLeft = (ownerDoc && ownerDoc["clientLeft"]) || (_body && _body["clientLeft"]) || 0;
                var scrollTop = (ownerDoc && ownerDoc["scrollTop"]) || (_body && _body["scrollTop"]) || 0;
                var clientTop = (ownerDoc && ownerDoc["clientTop"]) || (_body && _body["clientTop"]) || 0;
                point = [event.clientX + scrollLeft - clientLeft, event.clientY + scrollTop - clientTop];
            }
        }
        var reportData = {
            //点击的时间
            tm:tracker.timestamp(),
            //点击次数
            count:++count,
            //元素路径
            xp: xp,
            //元素部位
            ep: ep.join("|"),
            //点击的坐标
            pp: point.join("|"),
            //网页最大尺寸
            ps: getMaxPageSize().join("|"),
            //元素url
            u: ((href || "none") + "").substr(0, 200),
            //获取滚动数据
            vr:getMaxScrollSize("|"),
            //元素文本
            txt: ((text || "none") + "").substr(0, 30),
            cmd:'click'
        }; 
        return reportData
    }
    function getUlogApp() {
        var ulogApp = userConfig.ulogApp || document;
        if (ulogApp.nodeType) {
            if(ulogApp.nodeType == 9) {
                return document;
            }
            if(ulogApp.nodeName.toLowerCase() === "body") {
                return document.body;
            }
            if(ulogApp.nodeType == 1) {
                return ulogApp;
            }
        } else if(typeof ulogApp === "string") {
            return document.getElementById(ulogApp);
        }
        return null;
    }
    function init() {
        var ulogApp = getUlogApp();
        //要监听的事件列表和处理方案
        var eventArr = [["mousedown", "d", ulogApp], ["scroll", "s"], ["resize", "r"]];
        vr = getMaxScrollSize("|");
        for (var i = 0; (arr = eventArr[i++]);) {
            tracker.on(arr[2] || document, arr[0], function(type) {
                return function(event) {
                    handleEvent(event || window.event, type);
                }
            }(arr[1]))
        }
        tracker.on("unload", function() {
            if(!unloaded && userConfig.staytime) {
                unloaded = true;
                var closeData = {
                    //操作
                    cmd: "close",
                    //点击总数
                    count: count,
                    //获取滚动数据
                    vr: vr,
                    //页面停留时间
                    mst: tracker.timestamp()
                };
                tracker.report(null, closeData);
            }
        })
    }
    
    init();
}(window, document, ulog));