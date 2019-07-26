const app = getApp()
const appConfig = require("../config");
const valid = require("../js/valid");
const utils = require("../utils/util");
const cache = require("cache");

var savePwd = function(that, data){
  if(!data) {
    wx.showToast({
      title: '参数不正确，请检查后重试！～',
      duration: appConfig.duration
    });
    return;
  }
  if (!valid.minlength(data.name, 2)) {
    app.warning("名称不能少于2个字符");
    return;
  }
  if (!valid.minlength(data.account, 2)) {
    app.warning("账户名称不能少于3个字符");
    return;
  }
  if (!valid.minlength(data.password, 6)) {
    app.warning("密码不能少于6个字符");
    return;
  }
  if(!valid.isHttp(data.link)) {
    app.warning("链接地址不正确");
    return;
  }
  var header = {
    'content-type': 'application/x-www-form-urlencoded',
    'cookie': wx.getStorageSync(appConfig.storeKeys.sessionId)
  };
  if (utils.getSwitchToLocalStatus()){
    var timestamp = Date.parse(new Date());
    data.password = utils.encrypt(data.password, data.pubKey);
    delete data.pubKey;
    data.create_at = data.update_at = timestamp.toString().substring(0, 10);
    data.create_time = utils.showCreateTime();
    if(data.isEdit) {
      delete data.isEdit;
      cache.editSingle(data);
    }else{

      cache.addItem(data);
    }

    app.storeSuccess({
      code : 0, 
      msg : "保存成功"
    });
    return;
  }
  wx.request({
    url: utils.getUrl('savePwd'),
    data : data,
    header : header,
    method : "POST",
    dataType : "json",
    success : function(res) {
      app.storeSuccess(res.data);
    },
    fail : function(res) {
      wx.showToast({
        title: '保存失败，请重试',
        duration: appConfig.duration
      });
      app.storeSuccess(appConfig.networkError);
    }
  })
}

module.exports = savePwd