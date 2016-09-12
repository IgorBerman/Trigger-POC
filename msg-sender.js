"use strict";

const https = require('https');
const http = require('http');
const utils = require('./common/utils');
const config = require('./common/config');

module.exports = class MsgSender{
  constructor() {
  }

  pushToUserDevice(msg, options = {}) {
    options = utils.mergeObjects(options, config.PUSH_SERVER_INFO);
    console.log("sending message: ", msg, "options:", options);
    // handle response
    var callback = function(response) {
      var str = ''
      response.on('data', function (chunk) {
        str += chunk;
      });
      response.on('end', function () {
        console.log("http response from push server: ", str);
      });
    }

    var sender = options['method'] == 'https' ? https : http;
    // do request
    var req = sender.request(options, callback);
    if(options['timeoutMillis']) {
      req.on('socket', function (socket) {
          socket.setTimeout(options['timeoutMillis']);
          socket.on('timeout', function() {
              console.warn("timeout request");
              req.abort();
          });
      });
    }
    req.write(msg);
    req.end();

    req.on('error', function (e) {
      console.error("error sending reqeust", e);
    });
  }
}

/*
exports.sendHttp = function (msg, options) {

  var callback = function(response) {
    var str = ''
    response.on('data', function (chunk) {
      str += chunk;
    });

    response.on('end', function () {
      console.log(str);
    });
  }

  var req = http.request(options, callback);
  if(options['timeoutMillis']) {
    req.on('socket', function (socket) {
        socket.setTimeout(myTimeout['timeout']);
        socket.on('timeout', function() {
            req.abort();
        });
    });
  }
  req.end();
}
*/
