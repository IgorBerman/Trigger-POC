"use strict";

module.exports = class MsgCompiler{
  constructor() {
  }

  getCartAbandonMessage(pushId, cartItems, cartValue) {
    var discountPrecent = (cartValue > 100 /*100$*/) ? 5 : 10;
    return '{"password":"password","token":"' + pushId + '","alert":"We noticed that you have ' + cartItems + (cartItems > 1 ? ' items' : ' item') + ' in your cart. Please accept this ' + discountPrecent + '% discount on your carted items","payload":{"goToPage":"cart","couponCode":"bla","discountPercent":"' + discountPrecent + '"}}';
  }

  getPurchaseMessage(pushId, productId) {
    return '{"password":"password","token":"' + pushId + '","alert":"Thanks for completing your purchase! Please check out some additional products we believe you may enjoy","payload":{"goToPage":"recommendationOverlay", "productId": "' + productId + '", "widgetId":"1183"}}';
  }

}
