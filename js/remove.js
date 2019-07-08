const app = getApp();
const appConfig = require("../config");
const utils = require("../utils/util");
const cache = require("cache");

var remove = function (id, name) {
  //切换到本地后，从本地删除
  if (utils.getSwitchToLocalStatus()) {
    cache.removeItemByName(id, name);
    app.removeSuccessSync({
      code : 0,
      msg : "删除成功",
    })
    return;
  }
  var header = {
    'content-type': 'application/x-www-form-urlencoded',
    'cookie': wx.getStorageSync(appConfig.storeKeys.sessionId)
  };
  wx.request({
    url: utils.getUrl("remove"),
    header: header,
    data : {
      ids : id
    },
    method: "POST",
    dataType: "json",
    success: function (req) {
      app.removeSuccessSync(req.data)
    },
    fail: function (req) {
      app.removeSuccessSync(appConfig.networkError)
    }
  })
}

module.exports = remove