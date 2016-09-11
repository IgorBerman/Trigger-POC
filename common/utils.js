"use strict";

/* var options = {
  host: 'www.nodejitsu.com',
  path: '/',
  //since we are listening on a custom port, we need to specify it by hand
  port: '1337',
  //This is what changes the request to a POST request
  method: 'POST'
};
*/
exports.isEmptyObj = function (obj) {
  return Object.keys(obj).length === 0
}

exports.isNumeric = function (n) {
  return !isNaN(parseFloat(n)) && isFinite(n);
}

exports.mergeObjects = function (strong, weak){
    var result = {};
    for (var attrname in weak) { result[attrname] = weak[attrname]; }
    for (var attrname in strong) { result[attrname] = strong[attrname]; }
    return result;
}
