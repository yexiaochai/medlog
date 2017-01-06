/**
 * ulog - csp
 * @version 1.0
 * @copyright uaq.baidu.com
 *
 * @file uaq跨域资源检测
 * @author 赵志鑫(ZhaoZhiXin,zhaozhixin@baidu.com)
 */

(function (window, document, ulog, undefined) {
    var tracker = ulog('csp.track');
    //抽样率
    if (Math.random() > tracker.get('sample')) {
        return; 
    }
    //支持的element集合
    var tags = 'script,object,embed,param,iframe,frame';
    var regs1 = /[:@]/;
    var httpReg = /^(?:https??:\/\/)([^\/]+)/i;
    //最大提交次数
    var count = 20;
    //提交地址
    var reportUrl = null;
    //默认配置
    var defaultConfig = [
        {match: '*.baidu.com', monitor: false, type: 'all'},
        {match: '*', monitor: true, type: 'all'}
    ];
    //存放已经检查过了的url
    var checkedObj = {};
    var configs = tracker.get('config') || defaultConfig;
    tracker.remove('config');
    /**
     * [readConfig 读取配置]
     * @return {[object]} [转换后的配置]
     */
    function readConfig () {
        if(!configs) {
            return;
        }
        var realConfigs = [];
        var match, type, curHost = false, hostName = location.hostname;
        for(var i = 0; i < configs.length; i++) {
            match = configs[i].match;
            type = configs[i].type || 'all';
            monitor = configs[i].monitor;
            monitor = monitor === 'false' ? false : !!monitor;
            if ('string' == typeof match) {
                match = formatMatch(match);
            }
            if ('string' == typeof type) {
                type = formatType(type);
            }
            if(match.test(hostName)) {
                curHost = true;
            }
            realConfigs.push({
                match:match,
                type:type,
                monitor:monitor
            })
        }
        if(!curHost) {
            realConfigs.push({
                match:hostName,
                type:formatType(tags),
                monitor:false
            })
        }
        return realConfigs;
    }
    /**
     * [reportCSP 上报数据]
     * @param  {[element]} element [页面元素]
     * @return {[void]}         [description]
     */
    function reportCSP (element) {
        var tagName = element.tagName.toLocaleLowerCase(), matches;
        a: switch (tagName) {
            case 'object':
                element = element.data;
                break a;
            case 'param':
                tagName = element.getAttribute('name');
                element = /^src$|^movie$/i.test(tagName) && element.getAttribute('value');
                break a;
            default:
                element = element.src
            }

        //如果检查过 就不再检查了
        if(element && !checkedObj[element]) {
            checkedObj[element] = true;
            matches = element.match(httpReg);
            if(matches && checkDomain(matches[1], tagName)) {
                //最多上报count条数据
                if(0 <= --count) {
                    tracker.report(reportUrl, {
                        cspurl:element,
                        tag:tagName
                    });
                }
            }
        }
    }
    /**
     * [posElement 定位页面元素]
     * @return {[void]} [description]
     */
    function posElement () {
        var tagArr = tags.split(',');
        for (var i = 0; i < tagArr.length; i++) {
            var elements = document.getElementsByTagName(tagArr[i]);
            if (elements) {
                for (var j = 0; j < elements.length; j++) {
                    reportCSP(elements[j]);
                }
            }
        }   
    }
    /**
     * [checkDomain 判断一个域名是否跨域请求]
     * @param  {[string]} domain [域名]
     * @param  {[string]} tag    [标签名]
     * @return {[boolean]}       [true:是跨域请求,false:非跨域请求]
     */
    function checkDomain (domain, tag) {
        for(var i = 0; i < configs.length; i++) {
            var match = configs[i].match;
            var type = configs[i].type;
            if(match.test(domain)) {
                for(var j = 0; j < type.length; j++) {
                    if(tag === type[j]) {
                        return configs[i].monitor;
                    }
                }
                return false;
            }
        }
        return false;
    }
    /**
     * [formatType 转换type]
     * @param  {[string]} type [类型]
     * @return {[array]}      [转换后的类型]
     */
    function formatType (type) {
        var tagArr = tags.split(','), realType = [];
        type = type.toLocaleLowerCase().replace(/\s/g, '');
        if (type === 'all') {
            return tagArr;
        }       
        typeArr = type.split(',');
        for(var i = 0; i < tagArr.length; i++) {
            for(var j = 0; j < typeArr.length; j++) {
                if(tagArr[i] === typeArr[j]) {
                    realType.push(tagArr[i]);
                    break;
                }
            }
        }
        return realType;
    }

    /**
     * [formatMatch 转换match]
     * @param  {[string]} match [匹配规则]
     * @return {[array]}       [转换后的规则]
     */
    function formatMatch (match) {
        var item, i;
        arr = match.split(",");
        for (i = 0; i < arr.length; i++) {
            item = arr[i];
            item = item.replace(/\s/g, '').replace(/\./g, '\\.').replace(/\*/g, '.*').replace(/\?/g, '.');
            arr[i] = '^' + item + '$';
        }
        return new RegExp(arr.join('|'), 'i')
    }
    configs = readConfig();
    posElement();
}(window, document, ulog));