"use strict";
/**
 * Module dependencies.
 */

var express = require('express')
  , events = require('./routes/events')
  , config = require('./common/config')
  , http = require('http')
  , path = require('path'),
  testSender = require('./routes/test-sender');

require('console-stamp')(console, '[HH:MM:ss.l]');

var app = express();

// express.logger.format('mydate', function() {
//     var df = require('console-stamp/node_modules/dateformat');
//     return df(new Date(), 'HH:MM:ss.l');
// });
// app.use(express.logger('[:mydate]'));
//var strftime = require('strftime');

// String.prototype.startsWith = function(prefix) {
//     return this.indexOf(prefix) === 0;
// };
//
// String.prototype.endsWith = function(suffix) {
//     return this.match(suffix+"$") == suffix;
// };

config.init();
console.log("config:", config);

// all environments
app.set('port', config.LISTEN_PORT);
app.set('views', __dirname + '/views');
app.set('view engine', 'jade');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.bodyParser());
app.use(express.methodOverride());
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

// app.get('/event', event.process);
//
app.get('/test-sender', function(req, res, next) {testSender.process(res);})
http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});
events.ProcessQueue();
