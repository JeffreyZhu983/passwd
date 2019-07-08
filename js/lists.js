const app = getApp();
const appConfig = require("../config");
const utils = require("../utils/util");
const cache = require("cache");

var lists = function(_this, page, pageSize) {
  if (utils.getSwitchToLocalStatus()) {
    var res = cache.getFromLocal(page, pageSize);
    app.listSync(res);
    return;
  }
  var header = {
    'content-type': 'application/x-www-form-urlencoded',
    'cookie': wx.getStorageSync(appConfig.storeKeys.sessionId)
  };
  wx.request({
    url: utils.getUrl("lists", {
      page: page,
      pageSize: pageSize
    }),
    header: header,
    dataType: "json",
    success: function(res) {
      app.listSync(res.data)
    },
    fail: function(res) {
      app.listSync(appConfig.networkError);
    }
  });
}

module.exports = {
  pwd: lists
}