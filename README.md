<h1>前言</h1>
<p>一般来说，产品做出的原型多多少少会带有&ldquo;个人&rdquo;倾向，UI设计的交互也会人所不同，而当公司生存下来了后，数据沉淀达到一定量了后，这种迭代就决不能拍脑袋了，因为人是具有偏见的，如果带有&ldquo;偏见&rdquo;的产品上线后，其反响是不能预估的，我们不能将公司的生存放在&ldquo;可能&rdquo;这种说法上。</p>
<p>小步快跑，通过迭代来优化产品，但如果每个迭代都颠覆了之前的设计，那就是原地踏步，每一次迭代都要知道这个迭代哪里出了问题，然后再针对问题做优化，而不是频繁的改版，持续优化，这个就必须建立在比较良好的数据监控与数据分析上，人有偏见但是数据不会，。</p>
<p>所以大公司的核心产品，每一个决策，每一个迭代都需要分析各种数据，建立完善的AB Testing与小流量机制，待收到了充分的信息证明这次迭代是有效的后再做真正的全量更新。</p>
<p>数据中往往会有我们需要的答案，比如前段时间，我们发现我们的订单转化率比较低，那么我们盯着转换率本身是没有意义的，我们可以考虑影响几个数据的其他指标：</p>
<p>① 页面PV，一般来说增大PV能有效增加转化率</p>
<p>② 按钮点击的前提，比如需要登录后才能下单，和匿名下单的转化率对比</p>
<p>③ 优惠券使用情况（据说，中国没有5元买不到的用户）</p>
<p>④ ......</p>
<p>我们不同的渠道，很有可能产生这不同的场景，不同的场景下获得的数据，便能知道哪种是我们真实需要的，如此一来研发才能真正帮助公司做出正确的判断，为后续迭代提供参考。</p>
<p>系列文章：</p>
<p id="autoid-0-0-0" class="postTitle"><a id="cb_post_title_url" class="postTitle2" href="http://www.cnblogs.com/yexiaochai/p/6256832.html">【数据可视化之数据定义】如何设计一个前端监控系统</a>&nbsp;描述如何获取各种指标数据，如何归类，首篇博客补足</p>
<p id="autoid-0-0-0" class="postTitle"><a id="cb_post_title_url" class="postTitle2" href="http://www.cnblogs.com/yexiaochai/p/6256840.html">【数据可视化之持久化】如何设计一个前端监控系统</a>&nbsp;描述如何做存储（涉及大数据部分由其他同事整理）</p>
<p id="autoid-0-0-0" class="postTitle"><a id="cb_post_title_url" class="postTitle2" href="http://www.cnblogs.com/yexiaochai/p/6256861.html">【数据可视化之图表呈现（dashboard）】如何设计一个前端监控系统</a>&nbsp;描述如何将数据变为有效的展示</p>
<p><span style="font-size: 18px;"><strong>代码地址：<a href="https://github.com/yexiaochai/medlog" target="_blank">https://github.com/yexiaochai/medlog</a></strong></span></p>
<p><span style="color: #ff0000;">如果文中有误的地方请您指出。</span></p>
<h1>统计数据</h1>
<p>统计属于海量数据的范畴，产品分析做的越细，所产生的数据量越大，比如我要做一个用户点击热点的话，就需要收集用户所有的点击数据，这个可能是pv的数十倍；另一方面，海量统计应该是脱离业务本身的，用户可定制化打点需求，以满足不同业务的变化。</p>
<p>了解了基本概念，我们便可以确定我们到底需要什么数据，这个拍脑袋想不出来，就可以先进行基础穷举：</p>
<p>① pv&amp;uv</p>
<p>② 页面点击（pv&amp;uv）</p>
<p>③ 页面来源（web处理这个有些困难），定义页面从哪里来，在海量数据的情况下也可以不记录</p>
<p>④ 页面停留时间（web不一定准确）</p>
<p>⑤ 前端错误日志（这个比较庞大，后面详述）</p>
<p>⑥ 首屏载入速度</p>
<p>⑦ 用户环境收集（一般来说这个是附带的）</p>
<p>⑧ 跨域资源监测（监测所有非白名单脚本，发现脚本注入行为，附件特性）</p>
<p>而因为现在一套H5代码会用于不同的平台入口，所以这些数据又会额外具有&ldquo;<span style="color: #ff0000;">渠道信息</span>&rdquo;的标志。</p>
<p>再我们有了以上数据的情况下，我们能很轻易的得出某个渠道的转化率：</p>
<p>因为不同渠道表现也许会有所不同，有可能微信渠道的入口在首页，他的转化率计算一般会经过这么一个过程：</p>
<p>首页pv -&gt; 列表页pv -&gt; 订单填写页pv -&gt; 下单按钮点击pv -&gt; server最终成单数</p>
<p>而搜索引擎入口，可能直接就到了订单填写页，所以转化率计算公式又变成了：</p>
<p>订单填写页pv -&gt; 下单按钮点击pv&nbsp;-&gt; server最终成单数</p>
<p>这里结合首屏载入速度与页面停留时间，辅以用户点击轨迹，就能从某些程度上，追踪分析一个用户的行为了。</p>
<p>曾今有一次我们发现我们订单转化率下降了50%，于是老板让我们马上给出原因，我们当时怀疑过BUG，怀疑过运营商接口有问题，但是我们所有的推论都没有很好的佐证，于是各种查询数据库，最后与整个打点的pv数据，我们便得出了一个结论：</p>
<p>因为，多数用户的优惠券过期了，所以转化率急剧下降！！！</p>
<p>为了证明这个猜想，我们由将某一个渠道的优惠券加上，第二天转化率就回归了，我们这里能判断出转化率下降的原因和我们平时完善的打点是息息相关的。</p>
<h1>错误日志</h1>
<p>另一方面，当代码迭代到一定量的时候，code review也就只能解决很小一部分问题了，前端预警和前端错误日志产生的蛛丝马迹才会将一些隐藏的很深的BUG揪出来，所有的这一切都需要从数据采集开始。&nbsp;</p>
<p>我原来也遇到一个BUG，潜伏期很长，而且只有在特定的场景才会触发，这种BUG一般来说测试是无力的，当时我发现2个版本的日志有些奇怪的错误，再一步步抽丝剥茧，终于定位到了那个错误，当我们代码量大了后，合理的错误埋点+前端监控才能让系统变得更健康。</p>
<p>这里引用一张错误监控图（http://rapheal.sinaapp.com/2014/11/06/javascript-error-monitor/）：</p>
<p><img src="http://images2015.cnblogs.com/blog/294743/201701/294743-20170104113218987-88941820.png" alt="" /></p>
<p><img src="http://images2015.cnblogs.com/blog/294743/201701/294743-20170104113226644-1204107836.png" alt="" /></p>
<p>这里将上一周的错误数与本周做对比，如果没有大的迭代，稍微有异常就会产生报警，一般来说用户才是最好的测试，上线后没有报警就没有BUG。</p>
<p>PS：原来我们每次大版本发布，60%的几率要回滚......</p>
<h3>错误捕捉</h3>
<p>前端错误捕捉，一般使用onerror，这个偶尔会被try cache影响：</p>
<div class="cnblogs_code">
<pre><span style="color: #008080;">1</span> window.onerror = <span style="color: #0000ff;">function</span><span style="color: #000000;"> (msg, url, line, col, error) {
</span><span style="color: #008080;">2</span>     <span style="color: #008000;">//</span><span style="color: #008000;">......</span>
<span style="color: #008080;">3</span> }</pre>
</div>
<p>当时生产上的错误日志因为是压缩过的，真实抓到的错误信息十分难看：</p>
<p><img src="http://images2015.cnblogs.com/blog/294743/201701/294743-20170104144744534-1211930576.png" alt="" width="897" height="336" /></p>
<p>错误信息全部是第一行，报错的地方也是做过混淆的，如果不是页面划分的过开，这个错误会让人一头雾水，要想深入了解错误信息，这里便可以了解下source map了</p>
<h3>sourcemap</h3>
<p>简单来说，sourcemap是一个信息文件，里面存储着位置信息，也就是说，在js代码压缩混淆合并后的每个代码位置，对应的源码行列都是有标志的，有了这个source map，我们就能直接将源码对应的错误上报回去，大大降低我们的错误定位成本。</p>
<p>这里不同的业务使用的不同的构建工具，这里以grunt为例，grunt打包一般来说是使用的require，这里需要为其配置加入一段代码即可：</p>
<div class="cnblogs_code">
<pre><span style="color: #008080;">1</span> "generateSourceMaps": <span style="color: #0000ff;">true</span><span style="color: #000000;">,
</span><span style="color: #008080;">2</span> "preserveLicenseComments": <span style="color: #0000ff;">false</span><span style="color: #000000;">,
</span><span style="color: #008080;">3</span> "optimize": "uglify2",</pre>
</div>
<p><img src="http://images2015.cnblogs.com/blog/294743/201701/294743-20170104162952644-3208256.png" alt="" /></p>
<p>上面那个有一些问题，他将我的关键字过滤了，最后采用的这个：</p>
<p><img src="http://images2015.cnblogs.com/blog/294743/201701/294743-20170104190204081-1931736186.png" alt="" /></p>
<p>然后就会生成你要的sourcemap了</p>
<p><img src="http://images2015.cnblogs.com/blog/294743/201701/294743-20170104163024816-850272602.png" alt="" /></p>
<p>可以看到压缩文件中，包含了map引用：</p>
<p><img src="http://images2015.cnblogs.com/blog/294743/201701/294743-20170104163102378-893198454.png" alt="" /></p>
<p>于是我们线上代码就会变成这个样子：</p>
<p><img src="http://images2015.cnblogs.com/blog/294743/201701/294743-20170104190049144-586529501.png" alt="" width="533" height="289" /></p>
<p>这个时候，我们故意写个错误的话，这里查看报错：</p>
<p><img src="http://images2015.cnblogs.com/blog/294743/201701/294743-20170106121607831-1300618140.png" alt="" width="795" height="244" /></p>
<p>虽然看到的是源码，但是上报的数据似乎没有什么意义，这个时候可以借助一些第三方工具对日志做二次解析：</p>
<p>Sentry(<a class=" wrap external" href="https://link.zhihu.com/?target=https%3A//github.com/getsentry/sentry" rel="nofollow noreferrer" target="_blank">GitHub - getsentry/sentry: Sentry is cross-platform crash reporting built with love</a>)&nbsp;</p>
<p>并且，显然我们并不希望我们的源代码被人看到，所以我们将sourcemap文件存到线下，在线下将日志反应为我们看得懂的源码，这里简单看看这个文件定义：</p>
<div class="cnblogs_code">
<pre><span style="color: #008080;">1</span> -<span style="color: #000000;"> version：Source map的版本，目前为3。
</span><span style="color: #008080;">2</span> -<span style="color: #000000;"> file：转换后的文件名。
</span><span style="color: #008080;">3</span> -<span style="color: #000000;"> sourceRoot：转换前的文件所在的目录。如果与转换前的文件在同一目录，该项为空。
</span><span style="color: #008080;">4</span> -<span style="color: #000000;"> sources：转换前的文件。该项是一个数组，表示可能存在多个文件合并。
</span><span style="color: #008080;">5</span> -<span style="color: #000000;"> names：转换前的所有变量名和属性名。
</span><span style="color: #008080;">6</span> - mappings：记录位置信息的字符串。</pre>
</div>
<h3>线下翻译</h3>
<p>sourcemap的机制什么的，就不是我关注的重点，想了解的可以看<a href="http://www.ruanyifeng.com/blog/2013/01/javascript_source_map.html" target="_blank">阮老师的博客</a>，我现在的需求是：</p>
<p><span style="color: #ff0000;">获取了列号和行，如何可以在<strong>线下</strong>映射成我们要的真实行号</span></p>
<p>比如我们拿到了上述的行号与列号为{1,13310}，那么我们这里真实映射的是，合并文件中的某一行：</p>
<p><img src="http://images2015.cnblogs.com/blog/294743/201701/294743-20170106121757550-1066543991.png" alt="" width="559" height="211" /></p>
<p>要完成这一切，我们需要一套&ldquo;错误还原&rdquo;的后台系统，这个直接坐到js监控其中一环就好，比如我们可以简单这样做：</p>
<p><img src="http://images2015.cnblogs.com/blog/294743/201701/294743-20170106124241237-1646569105.png" alt="" width="380" height="289" /></p>
<p>这个被一<a href="https://raygun.com/sourcemaps" target="_blank">国外网站</a>实现了（一般来说要钱的......），所以是可以实现的，我们便去追寻他的实现即可。</p>
<p>后续在<a href="https://github.com/mozilla/source-map" target="_blank">github找了一个库</a>，完成了类似的功能，这里使用nodejs：</p>
<div class="cnblogs_code">
<pre><span style="color: #008080;">1</span> <span style="color: #0000ff;">var</span> mapData = require('./index.json'<span style="color: #000000;">);
</span><span style="color: #008080;">2</span> <span style="color: #008000;">//</span><span style="color: #008000;"> console.log(sourceMap);</span>
<span style="color: #008080;">3</span> <span style="color: #0000ff;">var</span> sourceMap = require('source-map'<span style="color: #000000;">);
</span><span style="color: #008080;">4</span> <span style="color: #0000ff;">var</span> consumer = <span style="color: #0000ff;">new</span><span style="color: #000000;"> sourceMap.SourceMapConsumer(mapData);
</span><span style="color: #008080;">5</span> <span style="color: #0000ff;">var</span> numInfo = consumer.originalPositionFor({ line: 1, column: 13330<span style="color: #000000;"> })
</span><span style="color: #008080;">6</span> console.log(numInfo)</pre>
</div>
<p>输出==&gt;</p>
<div class="cnblogs_code">
<pre><span style="color: #008080;">1</span> { source: 'pages/index/index.js'<span style="color: #000000;">,
</span><span style="color: #008080;">2</span>   line: 182<span style="color: #000000;">,
</span><span style="color: #008080;">3</span>   column: 0<span style="color: #000000;">,
</span><span style="color: #008080;">4</span>   name: 'layoutHtml' }</pre>
</div>
<p>于是，我们已经找到了自己要的东西了。最初，在快速调研的时候，我们不要知道<a href="https://github.com/mozilla/source-map" target="_blank">https://github.com/mozilla/source-map</a>是干什么的，但是如果我们<span style="color: #ff0000;">决定使用的话，就需要去仔细研究一番</span>了。</p>
<div class="cnblogs_code">
<pre><span style="color: #800000;">总而言之，线上错误日志搜集的行号信息，在线下平台便能很好的翻译了，这里方案有了，我接下来马上想法落地，落地情况在存储篇反馈</span></pre>
</div>
<p>错误日志这里，因为比较重要，也与普通的打点不一样，占的篇幅有点长，我们这里先继续往下说，等日志简单落地后再详述。</p>
<h1>采集系统</h1>
<p>本来，我们数据采集可以使用百度或者友盟，但是总有那么一些东西得不到满足，而且也没有数据对外输出的API，而公司如果稳步上升的话，做这块是迟早的事情，所以宜早不宜迟吧，而我这里主要还是先关注的移动体系，所以不太会关注兼容性，这个可以少考虑一些东西，真的遇到一些情况如跨域什么的，我们后面再说吧。</p>
<p>关于存储一块有很多需要考虑，比如如何计算首屏加载时间，webapp和传统网易的异同，hybrid的差异，uv的计算方法等都需要考虑，但是我们今天变只将采集代码实现即可，剩下的下篇再处理。</p>
<p>简单来讲，日志采集，其实就是一个get请求，你就算想用ajax发出去也是没有问题的，为了加入额外信息可能我们会做一个收口：</p>
<div class="cnblogs_code">
<pre><span style="color: #008080;">1</span> <span style="color: #000000;">ajax(url, {
</span><span style="color: #008080;">2</span>   s: ''
<span style="color: #008080;">3</span>   b: ''
<span style="color: #008080;">4</span>   c: ''
<span style="color: #008080;">5</span> });</pre>
</div>
<p>但是这个不是主流的做法，一般来说，我们打点信息使用的图片的方式发出，而因为重复的请求会被浏览器忽略，我们甚至会加入uniqueId做标志：</p>
<div class="cnblogs_code">
<pre><span style="color: #008080;">1</span> <span style="color: #0000ff;">var</span> log = <span style="color: #0000ff;">function</span><span style="color: #000000;"> () {
</span><span style="color: #008080;">2</span>     <span style="color: #0000ff;">var</span> img = <span style="color: #0000ff;">new</span><span style="color: #000000;"> Image();
</span><span style="color: #008080;">3</span>     img.src = 'http://domain.com/bi/event?'+<span style="color: #000000;"> uniqueId;
</span><span style="color: #008080;">4</span> };</pre>
</div>
<p>基本的采集实现就这么简单，但是后续逐步完善的功能，会增加复杂度，<span style="color: #ff0000;"><strong>于是我建立了一个git仓库存储代码，后续大数据一块的代码也将放到这里</strong></span>：</p>
<p><a href="https://github.com/yexiaochai/medlog" target="_blank">https://github.com/yexiaochai/medlog</a></p>
<p>闭门造车的意义不大，翻看前辈的一些采集代码比如<a href="https://github.com/fex-team/alogs/blob/master/alog.js" target="_blank">alog</a>，会发现他打点的一块是这样做的：</p>
<div class="cnblogs_code">
<pre><span style="color: #008080;"> 1</span> <span style="color: #008000;">/*</span><span style="color: #008000;">*
</span><span style="color: #008080;"> 2</span> <span style="color: #008000;"> * 上报数据
</span><span style="color: #008080;"> 3</span> <span style="color: #008000;"> *
</span><span style="color: #008080;"> 4</span> <span style="color: #008000;"> * @param {string} url 目标链接
</span><span style="color: #008080;"> 5</span> <span style="color: #008000;"> * @param {Object} data 上报数据
</span><span style="color: #008080;"> 6</span>  <span style="color: #008000;">*/</span>
<span style="color: #008080;"> 7</span> <span style="color: #0000ff;">function</span><span style="color: #000000;"> report(url, data) {
</span><span style="color: #008080;"> 8</span>     <span style="color: #0000ff;">if</span> (!url || !<span style="color: #000000;">data) {
</span><span style="color: #008080;"> 9</span>         <span style="color: #0000ff;">return</span><span style="color: #000000;">;
</span><span style="color: #008080;">10</span> <span style="color: #000000;">    }
</span><span style="color: #008080;">11</span>     <span style="color: #008000;">//</span><span style="color: #008000;"> @see http://jsperf.com/new-image-vs-createelement-img</span>
<span style="color: #008080;">12</span>     <span style="color: #0000ff;">var</span> image = doc.createElement('img'<span style="color: #000000;">);
</span><span style="color: #008080;">13</span>     <span style="color: #0000ff;">var</span> items =<span style="color: #000000;"> [];
</span><span style="color: #008080;">14</span>     <span style="color: #0000ff;">for</span> (<span style="color: #0000ff;">var</span> key <span style="color: #0000ff;">in</span><span style="color: #000000;"> data) {
</span><span style="color: #008080;">15</span>         <span style="color: #0000ff;">if</span><span style="color: #000000;"> (data[key]) {
</span><span style="color: #008080;">16</span>             items.push(key + '=' +<span style="color: #000000;"> encodeURIComponent(data[key]));
</span><span style="color: #008080;">17</span> <span style="color: #000000;">        }
</span><span style="color: #008080;">18</span> <span style="color: #000000;">    }
</span><span style="color: #008080;">19</span>     <span style="color: #0000ff;">var</span> name = 'img_' + (+<span style="color: #0000ff;">new</span><span style="color: #000000;"> Date());
</span><span style="color: #008080;">20</span>     entry[name] =<span style="color: #000000;"> image;
</span><span style="color: #008080;">21</span>     image.onload = image.onerror = <span style="color: #0000ff;">function</span><span style="color: #000000;"> () {
</span><span style="color: #008080;">22</span>         entry[name] =
<span style="color: #008080;">23</span>         image =
<span style="color: #008080;">24</span>         image.onload =
<span style="color: #008080;">25</span>         image.onerror = <span style="color: #0000ff;">null</span><span style="color: #000000;">;
</span><span style="color: #008080;">26</span>         <span style="color: #0000ff;">delete</span><span style="color: #000000;"> entry[name];
</span><span style="color: #008080;">27</span> <span style="color: #000000;">    };
</span><span style="color: #008080;">28</span>     image.src = url + (url.indexOf('?') &lt; 0 ? '?' : '&amp;') + items.join('&amp;'<span style="color: #000000;">);
</span><span style="color: #008080;">29</span> }</pre>
</div>
<p>其中有一块差异是绑定了onload等事件，<span style="color: #ff0000;">应该是想释放资源吧？</span></p>
<p>这里的代码，想与公司业务管理起来，比如根据业务线或者项目生成某个规则的id，上报代码比较简单，但是每次都要带哪些信息，还没很好的思路，先在这里立一个flag吧，接下来时间里全力补足吧，毕竟这块东西很多。</p>
<h1>结语</h1>
<p>前端数据有很多需要处理的地方，而数据的核心分为数据采集打点，数据持久化，数据使用，数据分析。</p>
<p>打点又会区分H5打点与native打点，native由于权限本身，能做的事情更多，但是底层数据收集基本能做到统一。</p>
<p>采集的代码是其中一部分，但采集的各项数据获取是另一个更重要的部分，会包含数据设计，各种细节处理，我们下篇文章接着研究，有兴趣的同学可关注。</p>
<p>代码地址：<a href="https://github.com/yexiaochai/medlog" target="_blank">https://github.com/yexiaochai/medlog</a></p>
