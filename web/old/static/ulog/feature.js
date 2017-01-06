/**
 * ulog - feature
 * @version 1.0
 * @copyright uaq.baidu.com
 *
 * @file uaq特性检测
 * @author 赵志鑫(ZhaoZhiXin,zhaozhixin@baidu.com)
 */

(function (window, document, ulog, undefined) {
    var tracker = ulog('feature.track');
    //抽样率
    if (Math.random() > tracker.get('sample')) {
        return; 
    }

    function _css(attr) { 
        var str = '',
            i,
            prefix = 'Webkit Moz O ms Khtml webkit moz o khtml'.split(''),
            arr = [];
        //如果属性不带-
        if (attr.indexOf('-') < 0) {
            //就把首字母给大写
            str = attr.charAt(0).toUpperCase() + attr.slice(1);
        } else {
            //转换为驼峰  box-shadow -> BoxShadow
            var len = attr.split('-').length,
                a = attr.split('-');
            for (i = 0; i < len; i++) {
                str = str + a[i].charAt(0).toUpperCase() + a[i].slice(1);
            }
        }
        //首字母转换为小写(普通属性)
        arr.push(str.charAt(0).toLowerCase() + str.slice(1));
        //加上各种前缀
        for (i = 0; i < prefix.length; i++) {
            arr.push(prefix[i] + str);
        }
        for (i = 0; i < arr.length; i++) {
            //只要支持某一个属性, 就返回true
            if (undefined !== document.body.style[arr[i]]) {
                return 'T';
            }
        }
        return 'F';
    }
    //任务列表
    var tasks = 'bdrs={borderRadius}' +
        '&bxsd={boxShadow}' +
        '&opty={opacity}' +
        '&txsd={textShadow}' +
        '&amnm={animateName}' +
        '&tstn={transition}' +  
        '&tsfm={transform}' +
        '&cavs={canvas}' + 
        '&dgdp={dragdrop}' +
        '&locs={localstorage}' +
        '&audo={audio}' +
        '&vido={video}' +
        '&xhr2={xmlHttpRequest}' + 
        '&svg={svg}' +
        '&wsql={openDatabase}' +
        '&natm={timing}' +
        '&ustm={mark}' +
        '&wbsk={websocket}' +
        '&geol={geoloacation}' +
        '&wbgl={webGL}' +
        '&hsty={history}' +
        '&ptmg={postMessage}' +
        '&file={file}';

    var testTasks = {
        testBorderRadius: function () {
            return _css('border-radius');
        },
        testBoxShadow: function () {
            return _css('box-shadow');
        },
        testOpacity: function () {
            return _css('opacity');
        },  
        testTextShadow: function () {
            return _css('text-shadow');
        },
        testAnimateName: function () {
            return _css('animation-name'); 
        },
        testTransition: function () {
            return _css('transition');
        },
        testTransform: function () {
            return _css('transform');
        },
        testCanvas: function () {
            var canvas = document.createElement('canvas');
            return !(!canvas.getContext || !canvas.getContext('2d'));
        },
        testDragdrop: function () {
            var oDiv = document.createElement('div');
            return 'draggable' in oDiv || 'ondragstart' in oDiv && 'ondrop' in oDiv;
        },
        testLocalstorage: function () {
            var localStorage = 'uaqLocalStorageTestKey';
            try {
                localStorage.setItem(localStorage, localStorage);
                localStorage.removeItem(localStorage);
                return true;
            } catch (e) {
                return false;
            }
        },
        testAudio: function () {
            var audio = document.createElement('audio');
            return !!audio.canPlayType;
        },
        testVideo: function () {
            var video = document.createElement('video');
            return !!video.canPlayType;
        },
        testXmlHttpRequest: function () {
            return !!window.ProgressEvent && 
            !!window.FormData &&
            window.XMLHttpRequest && 
            'withCredentials' in new XMLHttpRequest();
        },
        testSvg: function () {
            return !!document.createElementNS && 
            !!document.createElementNS('http://www.w3.org/2000/svg', 'svg').createSVGRect;
        },
        testOpenDatabase: function () {
            return 'openDatabase' in window;
        },
        testTiming: function () {
            return 'performance' in window && 'timing' in window.performance;
        },
        testMark: function () {
            return 'performance' in window && 'mark' in window.performance;
        },
        testWebsocket: function () {
            return 'WebSocket' in window || 'MozWebSocket' in window;
        },
        testGeoloacation: function () {
            return 'geolocation' in navigator;
        },
        testWebGL: function () {
            return !!window.WebGLRenderingContext;
        },
        testHistory: function () {
            return !(!window.history || !history.pushState);
        },
        testPostMessage: function () {
            return !!window.postMessage;
        },
        testFile: function () {
            return !(!window.File || !window.FileReader);
        }
    };
    function doTest() {
        var fnPrefix = 'test';
        var reportUrl = null;
        var reportData = tasks.replace(/\{([a-zA-Z0-9\-_]+)\}/g, function (match, fn) {
            fn = fnPrefix + fn.charAt(0).toUpperCase() + fn.slice(1);
            if (testTasks[fn]) {
                return testTasks[fn]() ? 'T' : 'F';
            } else {
                return null;
            }
        });
        tracker.report(reportUrl + '?' + reportData);
    }

    doTest();
}(window, document, ulog));