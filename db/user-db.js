"use strict";

module.exports = class UserDB{
  constructor() {
    this.users = new Map();
  }

  get(userId) {
    var userRec = this.users.get(userId);
    if(userRec == null) {
      userRec = new UserRecord();
      this.users.set(userId, userRec);
    }
    return userRec;
  }
}

class UserRecord{
  constructor() {
    this.events = new Map();
    this.cart = new Cart();
    this.pushId = null;
    this.lastPurchase = null;
    this.lastCartNotificationMillis = 0;
    this.lastPurchaseNotificationMillis = 0;
  }

  addEvent(eventTime, event) {
    this.events.set(eventTime, event);
  }

  // getCartItem(userId, productId) {
  //   return this.cart.get(productId);
  // }
  //
  // setCartItem(productId, quantity, value) {
  //   this.cart.set(productId, quantity, value);
  // }

  addToCartItem(productId, quantity, value) {
    var cartItem = this.cart.get(productId);
    var newQuantity = cartItem != null ? cartItem.quantity  + quantity : quantity;
    var newValue = cartItem != null ? cartItem.value + value : value;
    this.cart.set(productId, newQuantity, newValue); // mutability
  }

  removeFromCart(productId, quantity, value) {
    var cartItem = this.cart.get(productId);
    if(!cartItem) {
      console.warn("removeFromCart: item '" + productId + "' not found in cart");
      return;
    }
    // else
    console.log("processing item purchase/remove-from-cart: ", productId);
    var newQuantity = Math.max(0, cartItem.quantity - quantity);
    var newValue = Math.max(0, cartItem.value - value);
    console.log("== ", cartItem.value , "-", value, "=", newValue);

    if(newQuantity == 0) {
      this.cart.delete(productId); // remove from the cartDB
    } else {
      this.cart.set(productId, newQuantity, newValue);
    }
  }
  getPushId() {
    return this.pushId;
  }
  setPushId(pushId) {
    this.pushId = pushId;
  }

  setLatestPurchase(highestPricedItem, millis) {
    this.lastPurchase = highestPricedItem;
    this.lastPurchase['millis'] = millis;
  }
  getLatestPurchase() {
    return this.lastPurchase;
  }
  didUserPurchase() {
    return this.lastPurchase != null;
  }
  getLatestPurchaseMillis() {
    return this.lastPurchase.millis;
  }
  getLatestPurchaseProductId() {
    return this.lastPurchase.productId;
  }


  getCartValue() {
    return this.cart.getValue();
  }

  getCartSize() {
    return this.cart.size();
  }

  isCartEmpty() {
    return this.cart.isEmpty();
  }

  getCart() {
    return this.cart;
  }

  getLastCartNotificationMillis() {
    return this.lastCartNotificationMillis
  }

  setLastCartNotificationMillis(millis) {
    this.lastCartNotificationMillis = millis;
  }

  getLastPurchaseNotificationMillis() {
    return this.lastPurchaseNotificationMillis;
  }

  setLastPurchaseNotificationMillis(millis) {
    this.lastPurchaseNotificationMillis = millis;
  }
}

class Cart{
  constructor() {
    this.map = new Map();
  }

  get(productId) {
    var cartItem = this.map.get(productId);
    // if(cartItem == null) {
    //   cartItem = new CartItem();
    //   this.map.set(productId, cartItem);
    // }
    return cartItem;
  }

  set(productId, quantity, value) {
    var cartItem = new CartItem(quantity, value);
    this.map.set(productId, cartItem);
  }

  delete(productId) {
    this.map.delete(productId);
  }

  size() {
    return this.map.size;
  }

  isEmpty() {
    return this.map.size == 0
  }

  getValue() {
    var totalValue = 0;
    this.map.forEach(function (item, key, mapObj) {
      totalValue += item.value;
    });
    return totalValue;
  }
}

class CartItem{
  constructor(quantity = 0, value = 0) {
    this.quantity = quantity;
    this.value = value;
  }
}
