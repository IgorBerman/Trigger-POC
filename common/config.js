"use strict";

var config = {};

config.env = config.env || 'Dev';

config.init = function () {

  if (this.isDev()) {
    console.log("Using Developer mode");
    config.LISTEN_PORT = process.env.PORT || 1336;
    config.REDIS_PROPS = {host: 'hbasevm', port: '6379', db: '55'};
    config.PUSH_SERVER_INFO = {
      host: 'www.idanoshri.tk',
      path: '/push',
      //since we are listening on a custom port, we need to specify it by hand
      port: '443',
      //This is what changes the request to a POST request
      method: 'POST',
      // 3 seconds timeout
      timeoutMillis: 3000,
    };
  } else {
    console.log("Using Production mode");
    config.REDIS_PROPS = {host: 'localhost', port: '6379', db: '55'};
    config.PUSH_SERVER_INFO = {
      host: '127.0.0.1',
      path: '/push',
      //since we are listening on a custom port, we need to specify it by hand
      port: '443',
      //This is what changes the request to a POST request
      method: 'POST',
      // 3 seconds timeout
      timeoutMillis: 3000,
    };
  }

  // global
  config.REDIS_KEY = "events";
}

config.isDev = function() {
  return this.env == 'Dev';
}

module.exports = config;
