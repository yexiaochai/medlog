/**
 * ulog
 * @version 1.0.0
 * @copyright uaq.baidu.com
 *
 * @file uaq统计框架，基于alog(https://github.com/fex-team/alogs)
 * @author 赵志鑫(ZhaoZhiXin,zhaozhixin@baidu.com)
 */
(function (window, document, undefined) {
    var version = '1.0.0';
    //任务id
    var taskId = '12345';
    //用户标示
    var uid;
    /*is ie*/
    var ie = window.attachEvent && !window.opera;
    var timestampY, flag;
    /*object name*/
    var objectName = 'ulog';

    //避免重复加载
    if (window[objectName]) {
        return;
    }
    //打点，标示起始时间
    var startTime = (+new Date());

    //缓存已经加载的script
    var loadScripts = {};

    //缓存追踪器
    var trackers = {};

    //任务id


    /**
     * 监听列表
     */
    var ulogListeners = {};

    /**
     * 获取时间戳
     *
     * @param {Date} now 当前时间
     * @return {number} 返回时间戳
     */
    function timestamp(now) {
        return (now || new Date()) - startTime;
    }

    /**
     * 绑定事件
     *
     * @param {HTMLElement=} element 页面元素，没有指定则为 ulog 对象
     * @param {string} eventName 事件名
     * @param {Function} callback 回调函数
     */
    function on(element, eventName, callback) {
            if (!element) {
                return;
            }
            try {
                if (typeof element === 'string') {
                    callback = eventName;
                    eventName = element;
                    ulogListeners[eventName] = ulogListeners[eventName] || [];
                    ulogListeners[eventName].unshift(callback);
                    return;
                }
                if (element.addEventListener) {
                    element.addEventListener(eventName, callback, false);
                } else if (element.attachEvent) {
                    element.attachEvent('on' + eventName, callback);
                }
            } catch (ex) {}
        }
        /**
         * 注销事件绑定
         *
         * @param {HTMLElement} element 页面元素
         * @param {string} eventName 事件名
         * @param {Function} callback 回调函数
         */
    function un(element, eventName, callback) {
            if (!element) {
                return;
            }
            try {
                if (typeof element === 'string') {
                    callback = eventName;
                    eventName = element;
                    var listener = ulogListeners[eventName];
                    if (!listener) {
                        return;
                    }
                    var i = listener.length;
                    while (i--) {
                        if (listener[i] === callback) {
                            listener.splice(i, 1);
                        }
                    }
                    return;
                }
                //支持元素解绑
                if (element.removeEventListener) {
                    element.removeEventListener(eventName, callback, false);
                } else {
                    element.detachEvent && element.detachEvent('on' + eventName, callback);
                }
            } catch (ex) {}
        }
        /**
         * 触发事件
         *
         * @param {string} eventName 事件名 "error"、"close"
         * @return {Object} 返回当前实例
         * @example
         */
    function fire(eventName) {
            var listener = ulogListeners[eventName];
            if (!listener) {
                return;
            }
            var items = [];
            var args = arguments;
            for (var i = 1, len = args.length; i < len; i++) {
                items.push(args[i]);
            }
            var result = 0;
            var j = listener.length;
            while (j--) {
                if (listener[j].apply(this, items)) {
                    result++;
                }
            }
            return result;
        }
        /**
         * 脚本加载器
         *
         * @param {string} url 脚本链接
         * @param {Object} alias 别名
         * @example
         */
    function scriptLoader(url, alias) {
            alias = alias || {};
            var scriptUrl = alias[url] || url;
            if (!loadScripts[scriptUrl]) {
                loadScripts[scriptUrl] = true;
                var tagName = 'script',
                    script = document.createElement(tagName),
                    scriptEl = document.getElementsByTagName(tagName)[0];
                script.async = true;
                script.src = scriptUrl;
                scriptEl.parentNode.insertBefore(script, scriptEl);
            }
        }
        /**
         * 上报数据
         *
         * @param {string} url 目标链接
         * @param {Object} data 上报数据
         */
    function report(url, data) {
        var defaultUrl = '/img';
        url = url || defaultUrl;
        url = url.replace(/^null/, defaultUrl);
        if (!url || !data) {
            return;
        }
        var image = document.createElement('img');
        var items = [];
        for (var key in data) {
            if (data[key] || data[key] === 0) {
                items.push(key + '=' + encodeURIComponent(data[key]));
            }
        }
        image.onload = image.onerror = function () {
            image = image.onload = image.onerror = null;
        };
        image.src = url + (url.indexOf('?') < 0 ? '?' : '&') + items.join('&');
    }

    /**
     * 字段名使用简写
     *
     * @param {Object} protocolParameter 字段名对照表，如果为null表示不上报
     * @param {Object} data 待处理的数据
     * @return {Object} 返回处理后的数据
     */
    function runProtocolParameter(protocolParameter, data) {
        if (!protocolParameter) {
            return data;
        }
        var result = {};
        for (var p in data) {
            if (protocolParameter[p] !== null) {
                result[protocolParameter[p] || p] = data[p];
            }
        }
        return result;
    }

    /**
     * 合并两个对象
     *
     * @param {Object} a 对象1
     * @param {Object} b 对象2
     * @return {Object} 返回合并后的对象
     */
    function merge(a, b) {
        var result = {};
        for (var p in a) {
            if (a.hasOwnProperty(p)) {
                result[p] = a[p];
            }
        }
        for (var q in b) {
            if (b.hasOwnProperty(q)) {
                result[q] = b[q];
            }
        }
        return result;
    }

    /**
     * dom ready
     *
     * @param {function} fn 回调对象
     */
    function load(fn) {
        window.attachEvent ?
            window.attachEvent('onload', fn, !1) :
            window.addEventListener && window.addEventListener('load', fn);
    }

    /**
     * 设置cookie
     *
     * @param {string} key 键
     * @param {string} val 值
     * @param {string} time 有效期
     */
    function setCookie(key, val, time) {
        time = time || 15;
        var date = new Date();
        date.setTime((new Date()).getTime() + 1e3 * time);
        document.cookie = key + '=' + escape(val) + ';path=/;expires=' + date.toGMTString();
    }

    /**
     * 获取cookie
     *
     * @param {string} key 键
     * @return {string} 返回cookie值
     */
    function getCookie(key) {
        var arr = document.cookie.match(new RegExp('(^| )' + key + '=([^;]*)(;|$)'));
        return null != arr ? unescape(arr[2]) : null;
    }

    //在浏览器关闭和关闭之前做一些事情
    function unloadFn() {
        if (!(ie && 50 > new Date() - timestampY || flag)) {
            flag = true;
            var e = 0;
            for (var i in trackers) {
                var tracker = trackers[i].ins;
                e += tracker.fire('unload');
            }
            if (e) {
                //延迟0.1秒 ？
                for (var r = new Date(); 100 > new Date() - r;) {}
            }
        }
    }

    function getUid() {
        uid = getCookie('ULOG_UID');
        if (!uid) {
            uid = ((+new Date()).toString(36) + Math.random().toString(36).substr(2, 3));
            //设置一天的有效期
            setCookie('ULOG_UID', uid, 60 * 60 * 24);
        }
        return uid;
    }

    var Ulog = function (name) {
        this.name = name;
        this.fields = {};
    };
    Ulog.prototype = {
        commonFields: {},
        track: function (trackerMethod, args) {
            var trackMethod = this[trackerMethod];
            if (typeof trackMethod === 'function') {
                return trackMethod.apply(this, args);
            }
        },

        //打点
        timestamp: function (time) {
            return timestamp(time);
        },

        //移除某个key
        remove: function (key) {
            if (this.fields[key]) {
                this.fields[key] = null;
                delete this.fields[key]
            } else if (this.commonFields[key]) {
                this.commonFields[key] = null;
                delete this.commonFields[key]
            }
        },
        //设置值
        set: function (key, val, isCommon) {
            if (typeof key === 'string') {
                if (isCommon) {
                    this.commonFields[key] = val;
                } else {
                    //值都被设置到fields里面了
                    this.fields[key] = val;
                }
            } else if (typeof key === 'object') {
                //递归设置值
                for (var i in key) {
                    this.set(i, key[i], isCommon);
                }
            }

        },

        //获取值
        get: function (key, fn) {
            var val = this.fields[key];
            if (!val) {
                val = this.commonFields[key];
            }
            if (typeof fn === 'function') {
                fn(val);
            }
            return val;
        },

        //触发事件
        fire: function () {
            return fire.apply(null, arguments);
        },

        //绑定事件
        on: function (element, eventName, callback) {
            return on(element, eventName, callback);
        },
        getUid: function () {
            return getUid();
        },
        //脚本加载器，可以指定别名
        scriptLoader: function (url, alias) {
            return scriptLoader(url, alias || this.get('alias'));
        },

        //解除绑定
        un: function (element, eventName, callback) {
            return un(element, eventName, callback);
        },

        //获取cookie
        getCookie: function (key) {
            return getCookie(key);
        },

        //上报数据
        report: function (url, data) {
            data = data || {};
            data = this.merge(this.commonFields, data);
            data = this.merge(this.fields, data);
            data['uid'] = getUid();
            this.fire('send', data);
            return report(url, data);
        },

        //dom就绪
        load: function (fn) {
            return load(fn);
        },

        //设置cookie
        setCookie: function (key, val, time) {
            return setCookie(key, val, time);
        },

        //对象合并
        merge: function (a, b) {
            return merge(a, b);
        },
        //初始化方法
        init: function (arr) {
            for (var i = 0; i < arr.length; i++) {
                ulog('scriptLoader', arr[i]);
            }
        }
    };
    //支持单方法调用@xxx
    window[objectName] = function (params) {
        var trackerName, trackerMethod, args = [].slice.call(arguments).slice(1);
        // 'hunter.send' -> [1]=>'hunter', [2]=>'send'
        String(params).replace(/^(?:([\w$_]+)\.)?(@?\w+)$/,
            function (all, name, method) {
                trackerMethod = method.replace('@', '');
                trackerName = name && typeof name === 'string' ? name : 'default';
            }
        );
        if (!trackers[trackerName]) {
            trackers[trackerName] = {
                name: trackerName,
                args: args,
                ins: new Ulog(trackerName)
            };
        }
        if (trackerMethod === 'track') {
            trackers[trackerName].ins.set('type', trackerName);
            return trackers[trackerName].ins;
        }
        return trackers[trackerName].ins.track(trackerMethod, args);
    };

    if (ie) {
        on(document, 'mouseup', function (ev) {
            var target = ev.target || ev.srcElement;
            1 === target.nodeType &&
                /^ajavascript:/i.test(target.tagName + target.href) &&
                (timestampY = new Date());
        });
    }

    on(window, 'beforeunload', unloadFn);
    on(window, 'unload', unloadFn);
}(window, document));