const app = getApp();
const appConfig = require("../config");
const utils = require("../utils/util");

var saveClientPublicKey = function (_this, publicKey, privateKey) {
  var header = {
    'content-type': 'application/x-www-form-urlencoded',
    'cookie': wx.getStorageSync(appConfig.storeKeys.sessionId)
  };
  var data = {
    'publicKey': publicKey,
  };
  wx.request({
    url: utils.getUrl("savePublicKeyClient"),
    data: data,
    header: header,
    method: 'POST',
    dataType: 'json',
    success: function (res) {
      if(res && res.data){
        if(!res.data.data) {
          res.data.data = {};
        }
        res.data.data.publicKey = publicKey;
        res.data.data.privateKey = privateKey;
      }
      app.sslKeySaveSync(res.data);
    },
    fail: function (res) {
      app.sslKeySaveSync(appConfig.networkError);
    }
  })
}

module.exports = saveClientPublicKey