const app = getApp();
const appConfig = require("../config");
const utils = require("../utils/util");

var decrypt = function (str, privateKey) {
  var header = {
    'content-type': 'application/x-www-form-urlencoded',
    'cookie': wx.getStorageSync(appConfig.storeKeys.sessionId)
  };
  wx.showLoading({
    title: '正在解密',
  });
  wx.request({
    url: utils.getUrl("decrypt"),
    header: header,
    data : {
      val : str,
      private_key : privateKey,
    },
    dataType: 'json',
    method : "post",
    success: function (res) {
      wx.hideLoading();
      app.sslKeyDecryptSync(res.data);
    },
    fail: function () {
      wx.showToast({
        title: '请求失败，请重试～',
        duration: 3000
      });
      wx.hideLoading();
    }
  })
}

module.exports = decrypt