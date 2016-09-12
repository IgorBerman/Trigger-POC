"use strict";

var config = {};
config.env = config.env || process.env.TRIGGERS_ENV || 'Dev';

config.init = function () {

  if (this.isDev()) {
    console.log("Using Developer mode");
    config.REDIS_PROPS = {host: 'hbasevm', port: '6379', db: '55', returnBuffers: true};
    config.PUSH_SERVER_INFO = {
      myProtocol: 'http',
      host: '127.0.0.1',
      path: '/push',
      //since we are listening on a custom port, we need to specify it by hand
      port: '12323',
      //This is what changes the request to a POST request
      method: 'POST',
      // 3 seconds timeout
      timeoutMillis: 3000,
    };
    config.USE_MSG_PACK = true;
  } else {
    console.log("Using Production mode");
    config.REDIS_PROPS = {host: 'localhost', port: '6379', db: '55', returnBuffers: true};
    config.PUSH_SERVER_INFO = {
      myProtocol: 'http',
      host: '127.0.0.1',
      path: '/push',
      //since we are listening on a custom port, we need to specify it by hand
      port: '12323',
      //This is what changes the request to a POST request
      method: 'POST',
      // 3 seconds timeout
      timeoutMillis: 3000,
    };
    config.USE_MSG_PACK = true;
  }

  // global
  config.LISTEN_PORT = process.env.PORT || 1336;
  config.REDIS_KEY = "events";
}

config.isDev = function() {
  return this.env == 'Dev';
}

module.exports = config;
