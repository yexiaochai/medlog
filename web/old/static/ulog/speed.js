/**
 * ulog - speed
 * @version 1.0
 * @copyright uaq.baidu.com
 *
 * @file uaq速度统计
 * @author 赵志鑫(ZhaoZhiXin,zhaozhixin@baidu.com)
 */
(function (window, document, ulog, undefined) {
    var tracker = ulog('speed.track');
    //抽样率
    if (Math.random() > tracker.get('sample')) {
        return;
    }
    //屏幕尺寸
    //浏览器信息
    //timing performance

    function _uaMatch(uaa) {
            var rchrome = /(chrome)\/(\d+\.\d)/,
                rsafari = /(\d+\.\d)?(?:\.\d)?\s+safari\/?(\d+\.\d+)?/,
                ropera = /(opera)(?:.*version)?[ \/]([\w.]+)/,
                rmsie = /(msie) ([\w.]+)/,
                rmozilla = /(mozilla)(?:.*? rv:([\w.]+))?/,
                ua = uaa.toLowerCase(),
                b = {};
            var match = rchrome.exec(ua) || ropera.exec(ua) || rmsie.exec(ua) || ua.indexOf('compatible') < 0 &&
                rmozilla.exec(ua) || [];
            if (rsafari.test(ua) && !/chrome/.test(ua)) {
                match[1] = 'safari';
                match[2] = RegExp['$1'] || RegExp['$2'];
            }
            return {
                browser: match[1] || 'unknown',
                version: match[2] || '0'
            };
        }
        //浏览器信息
    function getBrowser() {
            var b = _uaMatch(navigator.userAgent);
            var browser = b.browser;
            if (browser === 'msie') {
                if (document.documentMode) {
                    var vers = b.version.substring(0, 1);
                    if (window.performance) {
                        browser += '9.0';
                    } else {
                        browser += '8.0';
                    }
                } else {
                    browser += b.version;
                }
            }
            return browser;
        }
        //分辨率信息
    function getScreen() {
            var screen = window.screen;
            if (screen) {
                return screen.width + '*' + screen.height + '|' + screen.availWidth + '*' + screen.availHeight;
            }
        }
        //timing performance
    function getPerformance() {
            var performance = window.performance;
            if (performance && performance.timing) {
                var timing = performance.timing;
                var start = timing.domainLookupStart;
                var fetchTiming = {
                    //dns时间
                    dns: timing.domainLookupEnd,
                    //tcp连接时间
                    ct: timing.connectEnd,
                    //首字节时间
                    st: timing.responseStart,
                    //html传输完成时间 
                    tt: timing.responseEnd,
                    //domComplete时间
                    dct: timing.domComplete,
                    //loadEventEnd时间
                    olt: timing.loadEventEnd
                };
                for (var i in fetchTiming) {
                    fetchTiming[i] = Math.max(fetchTiming[i] - start, 0);
                }
                return fetchTiming;
            }
        }
        //获取网络连接方式（如果有）
    function getMnt() {
            return (navigator.connection || navigator.mozConnection || navigator.webkitConnection || {
                type: '0'
            }).type;
        }
        //获取来源信息
    function getRef(type) {
        var ref = document['referrer'];
        switch (type) {
            //只回送host不回送完整的ref
        case 1:
            if (!ref) {
                return;
            }
            var str = '';
            ref.replace(/(^\w+:\/\/)?([^\/]+)/, function (protocol, host) {
                str = host;
            });
            return document.location.host === str ? ref : str;
        default:
            return ref;
        }
    }

    function init() {
        var nav = window.navigator;
        var reportData = {
            'browser': getBrowser(),
            'screen': getScreen(),
            'mnt': getMnt(),
            'ref': getRef() || '0',
            'url': (location.host + location.pathname),
            'cookie': nav.cookieEnabled,
            'language': nav.language,
            'os': nav.platform
        };
        reportData = tracker.merge(reportData, getPerformance());
        tracker.on('send', function (data) {
            for (var i in data) {
                if (/^(c_.*|ht|drt|lt|fs|wt|wtt)$/.test(i)) {
                    if (data[i]) {
                        data[i] = Math.abs(tracker.timestamp(data[i]));
                    }
                }
            }
        });
        //上报数据
        tracker.report(null, reportData);

    }
    init();
}(window, document, ulog));