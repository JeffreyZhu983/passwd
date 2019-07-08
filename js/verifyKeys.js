const app = getApp()
const appConfig = require("../config");
const utils = require("../utils/util");

var verifyKeys = function (publicKey, privateKey) {
  var header = {
    'content-type': 'application/x-www-form-urlencoded',
    'cookie': wx.getStorageSync(appConfig.storeKeys.sessionId)
  };
  wx.request({
    url: utils.getUrl('verifyKeys'),
    header: header,
    data : {
      public_key : publicKey,
      private_key : privateKey
    },
    method: "POST",
    dataType: "json",
    success: function (req) {
      app.verifyKeysSuccessSync(req.data)
    },
    fail: function (req) {
      app.verifyKeysSuccessSync(appConfig.networkError);
    }
  })
}

module.exports = verifyKeys