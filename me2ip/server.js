var restify = require('restify');
var server = restify.createServer();

server.use(function(req, res, next) {
    res.setHeader('Access-Control-Allow-Origin', '*');

    if(req.headers['cf-connecting-ip']) {
        req.user_ip = req.headers['cf-connecting-ip'];
    } else if(req.headers['x-forwarded-for'] && req.headers['x-forwarded-for'].split(',').length) {
        req.user_ip = req.headers['x-forwarded-for'].split(',')[0];// might change to use a different index
    } else if(req.headers['x-forwarded-for'] && !req.headers['x-forwarded-for'].split(',').length) {
        req.user_ip = req.headers['x-forwarded-for'];
    } else {
        req.user_ip = req.connection.remoteAddress;
    }

    next();
});

var os = require('os');
var prettysize = require('prettysize');

var ipv4Regex = /^(\d{1,3}\.){3,3}\d{1,3}$/;
var ipv6Regex = /^(::)?(((\d{1,3}\.){3}(\d{1,3}){1})?([0-9a-f]){0,4}:{0,2}){1,8}(::)?$/i;

var stats = {
    json: 0,
    text: 0
};

// This will show a html file or other static content
server.get('/', restify.serveStatic({directory: __dirname, default: 'index.html'}));

server.get(/\/assets\/?.*/, restify.serveStatic({directory: __dirname + '/public'}))

// This will give them their ip in plain text
server.get('/get', function(req, res, next) {
    stats.text++;
    res.setHeader('Content-type', 'text/plain');
    return res.send(req.user_ip);
});

// This will give their ip in JSON
server.get('/json', function(req, res, next) {
    stats.json++;

    var family = ipv6Regex.test(req.user_ip) ? 'IPv6' : 'IPv4';

    return res.send({ip : req.user_ip, family: family});
});

server.get('/stats', function(req, res, next) {
    stats.memory = prettysize(process.memoryUsage().rss);
    res.send(stats);
});

server.listen(process.env.PORT || 8080, function() {
    console.log('Restify server started at ' + server.url);
});