const app = getApp();
const appConfig = require("../config");
const utils = require("../utils/util");

var saveKeys = function (_this, forceUpdate) {
  var header = {
    'content-type': 'application/x-www-form-urlencoded',
    'cookie': wx.getStorageSync(appConfig.storeKeys.sessionId)
  };
  var data = {
    'public_key': _this.data.publicKey,
    'private_key': _this.data.privateKey,
  };
  if (forceUpdate) {
    data.forceUpdate = forceUpdate;
  }
  wx.request({
    url: utils.getUrl("resetPublicKey", {opt : _this.data.opt}),
    data: data,
    header: header,
    method: 'POST',
    dataType: 'json',
    success: function (res) {
      app.sslKeySaveSync(res.data);
    },
    fail : function(res) {
      app.sslKeySaveSync(appConfig.networkError);
    }
  })
}

module.exports = saveKeys