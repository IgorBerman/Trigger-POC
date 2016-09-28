"use strict";
/*
 * GET home page.
 */
const msgpack = require('msgpack');
const utils = require('../common/utils');
const util = require('util');
const MsgSenderClass = require('../msg-sender.js');

const msgSender = new MsgSenderClass();


exports.process = function(req, res) {
  console.log("Sending test message");
  var msg = '{"password":"password","token":"' + req.query.token + '","alert":"alert","payload":{"goToPage":"cart","couponCode":"bla","discountPercent":"5"}}';
  msgSender.pushToUserDevice(msg);
  res.end();
}
