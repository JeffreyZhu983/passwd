const app = getApp();
const appConfig = require("../config");
const utils = require("../utils/util");

var genKeys = function(that){
  var header = {
    'content-type': 'application/x-www-form-urlencoded',
    'cookie': wx.getStorageSync(appConfig.storeKeys.sessionId)
  };
  wx.showLoading({
    title: '正在拉取数据',
  });
  wx.request({
    url: utils.getUrl("requestSslKey"),
    header : header,
    dataType : 'json',
    success : function(res){
      wx.hideLoading();
        app.log(res)
        if(res.data.code > 0) {
          wx.showToast({
            title: res.data.msg || "获取公私钥失败",
            duration:appConfig.duration
          });
          return;
        }
        app.sslKeyRequestSync(res.data);
    },
    fail: function(){
      app.sslKeyRequestSync(appConfig.networkError);
      wx.hideLoading();
    }
  })
}

module.exports = genKeys