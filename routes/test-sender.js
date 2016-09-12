"use strict";
/*
 * GET home page.
 */
const msgpack = require('msgpack');
const utils = require('../common/utils');
const util = require('util');
const MsgSenderClass = require('../msg-sender.js');

const msgSender = new MsgSenderClass();


exports.process = function(res) {
  console.log("Sending test message");
  var msg = '{"password":"password","token":"d3592c1f619eb82db1cabe216ba313221781e3c42064b9715d89708d6d09c532","alert":"alert","payload":{"goToPage":"cart","couponCode":"bla","discountPercent":"5"}}';
  msgSender.pushToUserDevice(msg);
  res.end();
}
