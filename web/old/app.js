var express = require('express');

var path = require('path');
var cookieParser = require('cookie-parser');
var session = require('express-session');
var bodyParser = require('body-parser');
var fs = require('fs');

var app = express();
var domainMiddleware = require('express-domain-middleware');

app.enable('trust proxy');
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
//catch all async error
app.use(domainMiddleware);
app.use(bodyParser.json());
app.use(bodyParser.urlencoded());
app.use(cookieParser());
app.use(session({secret: 'keyboard cat'}));

app.use('/static', express.static(path.join(__dirname, 'static')));
app.use('/template', express.static(path.join(__dirname, 'template')));

app.get('/clear', function (req, res) {
    var staticPath = path.join(__dirname, 'static');
    var viewPath = path.join(__dirname, 'views/index.ejs');
    var filePath = path.join(staticPath, 'st.gif');
    var indexFile = fs.readFileSync(viewPath, 'utf-8');
    indexFile = indexFile.replace(/<body>(.*?)<\/body>/, function(match){
        return '<body><div><input class="btn" type="button" value="clean data" /><a href="/static/ulog/test.html" target="_blank">demo</a></div></body>';
    });
    fs.writeFileSync(viewPath, indexFile, 'utf-8');
    res.json({code:200, data:null});
});
app.get('/img', function (req, res) {
    var staticPath = path.join(__dirname, 'static');
    var viewPath = path.join(__dirname, 'views/index.ejs');
    var filePath = path.join(staticPath, 'st.gif');
    var indexFile = fs.readFileSync(viewPath, 'utf-8');
    indexFile = indexFile.replace('</body>', function(){
        return '<div class="data-div" data-url=\''+JSON.stringify(req.query)+'\'><div class="title '+req.query.type+'"><span>'+req.query.type+'</span>'+req.url+'</div><ul></ul></div></body>';
    });
    fs.writeFileSync(viewPath, indexFile, 'utf-8');
    fs.exists(filePath, function (exists) {
        res.sendfile(filePath);
    });
});
app.use('/', function(req, res) {
    res.render('index', {});
});
/// catch 404 and forward to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});


// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {  
    res.status(err.status || 500);
    console.warn("[server error][message="+err.message+"][status="+err.status+"][stack="+err.stack+"]");
    res.render('error', {
        message: err.message,
        error: {
            status:err.status,
            stack:err.stack
        }
    });
});
//catchÎ´²¶»ñµÄÒì³£
process.on('uncaughtException', function (err) {
    console.log("[uncaughtException][error="+err+"]");
});

exports.app = app;
