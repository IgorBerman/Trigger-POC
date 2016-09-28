"use strict";
const redis = require('dy-ioredis');
const config = require('./common/config');

// const REDIS_KEY = "events";
// const REDIS_PROPS = {host: 'hbasevm', port: '6379', db: '55'};

module.exports = class InputManager{
  constructor() {
    this.redisClient = null;
  }

  makeSureRedisIsUp() {
    if(this.redisClient === null) {
      this.initRedis();
    }
  }

  initRedis() {
    console.log("init redis client");
    this.redisClient = redis.createClient(config.REDIS_PROPS);
    this.redisClient.on("error", function (err) {
        console.log("Redis Error " + err);
    });
  }

  getEvent(callback) {
    this.makeSureRedisIsUp();
    this.redisClient.rpop(config.REDIS_KEY, callback);
  }

};
