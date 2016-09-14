"use strict";
/*
 * GET home page.
 */
const msgpack = require('msgpack');
const utils = require('../common/utils');
const util = require('util');
const config = require('../common/config');

const EVENT_SET_PUSH_ID = 'dy-update-push-id-v1';
const EVENT_APP_EXIT = 'dy-app-exit-v1';
const EVENT_PURCHASE = "purchase-v1";
const EVENT_ADD_TO_CART = "add-to-cart-v1";
const EVENT_REMOVE_FROM_CART = "remove-from-cart-v1";

// Classes
const UsersDBClass = require('../db/user-db.js');
const MsgCompilerClass = require('../msg-compiler.js');
const MsgSenderClass = require('../msg-sender.js');
const InputManagerClass = require('../input-manager.js');
// members
const usersDB = new UsersDBClass();
const msgCompiler = new MsgCompilerClass();
const msgSender = new MsgSenderClass();
const inputManager = new InputManagerClass();

exports.ProcessQueue = function() {
  waitForPush();
}

function waitForPush () {
  try {
    inputManager.getEvent(function (err, event) {
      if( err != null ) {
        console.error("error fetching event:", err);
        setTimeout(waitForPush, 2000);
        return;
      } else if(event !== null && event.length > 1) {
        processEvent(event);
      }
      setTimeout(waitForPush, 100);
    });
  } catch (e) {
    console.error("Unable to Process message: ", e, e.stack || '');
    setTimeout(waitForPush, 2000);
  }
}

function processEvent(event) {
  var data = config.USE_MSG_PACK ? msgpack.unpack(event) : JSON.parse(event);
  console.log("-------------------------------------------------------");
  console.log("got message from queue: ", data);
  var userRecord = usersDB.get(data.user);
  switch (data.eventType) {
    case EVENT_APP_EXIT:
      var msg = getMessageToSend(userRecord); //msgCompiler.getMessage(userRecord);
      if(msg != null) {
        msgSender.pushToUserDevice(msg);
      }
      // userRecord.addEvent(data.millis, data);
      break;
    case EVENT_PURCHASE:
      processPurchase(data, userRecord);
      userRecord.addEvent(data.millis, data);
      userRecord.clearEvents();
      break
    case EVENT_ADD_TO_CART:
      processAddToCart(data, userRecord);
      userRecord.addEvent(data.millis, data);
      break;
    case EVENT_REMOVE_FROM_CART:
      processRemoveFromCart(data, userRecord);
      userRecord.addEvent(data.millis, data);
      break;
    case EVENT_SET_PUSH_ID:
      userRecord.setPushId(data.pushId);
      break;
    default:
      console.warn("unknow event type ", data.eventType);
      break;
  }
  console.log("-----");
  console.log("usersDB after last message: ", util.inspect(usersDB, {depth:5}));
}

function processAddToCart(data, userRecord) {
  data.rate = sanitizeRate(data.rate);
  userRecord.addToCartItem(data.properties.productId, parseInt(data.properties.quantity), parseFloat(/*data.value*/data.properties.value) * data.rate);
}

function sanitizeRate(rate) {
  if(!rate || rate == 0) {
    console.warn("validateRate: value rate is 0 or unavilabe, setting to 1: " + rate);
    return 1;
  }
  return rate
}

function processRemoveFromCart(data, userRecord) {
  data.rate = sanitizeRate(data.rate);
  removeFromCartDB(data.properties/*purchasedItem*/, userRecord, data.properties.productId, data.rate);
}

// rate = original value / converted value
function removeFromCartDB(purchasedItem, userRecord, productId, rate) {
  userRecord.removeFromCart(productId, parseFloat(purchasedItem['quantity']), parseFloat(purchasedItem['itemPrice'] || purchasedItem['value'])*rate);
}


function processPurchase(data, userRecord) {
  if( !data.properties.cart ) {
    console.warn("processPurchase: purchase event send without a cart");
    return;
  }
  // else
  data.rate = sanitizeRate(data.rate);

  var maxPrice = 0;
  var highestPricedItem = null;
  // traversing purchased items
  var arrayLength = data.properties.cart.length;
  for (var i = 0; i < arrayLength; i++) {
    var purchasedItem = data.properties.cart[i];
    removeFromCartDB(purchasedItem, userRecord, purchasedItem.productId, data.rate);

    if(highestPricedItem == null || purchasedItem['itemPrice'] > highestPricedItem['itemPrice']) {
      highestPricedItem = purchasedItem;
    }
  }

  if(highestPricedItem != null) {
    userRecord.setLatestPurchase(highestPricedItem, data.millis);
  }
}

const MILLIS_SINCE_LAST_PURCHASE = 3000; //1000 * 60 * 60 * 24; // 1 day
const MILLIS_SINCE_LAST_CART_NOTIFICATION = 3000; // 1000 * 60 * 60 * 24; // 1 day

function getMessageToSend(userRecord) {
  var pushId = userRecord.getPushId();
  if(!pushId) {
    console.warn("user missing push ID, skipping");
    return null;
  }

  var msg = null;
  var nowMillis = (new Date).getTime();
  // should we send a message?
  if(!userRecord.isCartEmpty() && (nowMillis - userRecord.getLastCartNotificationMillis() > MILLIS_SINCE_LAST_CART_NOTIFICATION)) { // there are items in the cart (not purchased)
    var cartValue = userRecord.getCartValue();
    var cartItems = userRecord.getCartSize();
    console.log("cart value = ", cartValue);
    msg = msgCompiler.getCartAbandonMessage(pushId, cartItems, cartValue);
    userRecord.setLastCartNotificationMillis(nowMillis);
  } else if( userRecord.didUserPurchase() && (nowMillis - userRecord.getLastPurchaseNotificationMillis()) > MILLIS_SINCE_LAST_PURCHASE) {
    var productId = userRecord.getLatestPurchaseProductId();
    msg = msgCompiler.getPurchaseMessage(pushId, productId);
    userRecord.setLastPurchaseNotificationMillis(nowMillis);
  }
  return msg;
}
