const app = getApp();
const appConfig = require("../config");
const utils = require("../utils/util");

var saveKeys = function (that, forceUpdate) {
  var header = {
    'content-type': 'application/x-www-form-urlencoded',
    'cookie': wx.getStorageSync(appConfig.storeKeys.sessionId)
  };
  var data = {
    'public_key': that.data.publicKey,
    'private_key' : that.data.privateKey,
  };
  if (forceUpdate) {
    data.forceUpdate = forceUpdate;
  }
  wx.request({
    url: utils.getUrl('savePublicKey'),
    data : data,
    header: header,
    method : 'POST',
    dataType: 'json',
    success: function (res) {
      app.log(res)
      if (res.data.code == 5) {
        wx.showModal({
          title: '提示',
          content: res.data.msg || "保存失败",
          cancelText: "取消",
          confirmText: "更新",
          success: function (item) {
            if (item.confirm) {
              app.log("更新", res.data.forceUpdate);
              saveKeys(that, res.data.forceUpdate);
            } else {
            }
          }
        });
      }else if(res.data.code > 0){
        wx.showModal({
          title: '提示',
          content: res.data.msg || "保存失败",
          showCancel: false,
          success: function (res) {
          }
        });
        return;
      }
      app.sslKeySaveSync(res.data);
    },
    fail : function(res) {
      app.sslKeySaveSync(appConfig.networkError);
    }
  })
}

module.exports = saveKeys