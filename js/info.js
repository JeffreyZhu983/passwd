const app = getApp();
const appConfig = require("../config");
const utils = require("../utils/util");
const cache = require("cache");

var info = function (id) {
  //如果用户切换成本地了，就从本低读取
  if (utils.getSwitchToLocalStatus()){
    var info = cache.info(id);
    var res = {
      code : 0,
    };
    if(info === false) {
      res.code = 404;
      res.msg = "没有找到相关记录";
    }else{
      res.data = info;
    }
    app.infoSuccessSync(res)
    return res;
  }
  var header = {
    'content-type': 'application/x-www-form-urlencoded',
    'cookie': wx.getStorageSync(appConfig.storeKeys.sessionId)
  };
  wx.request({
    url: utils.getUrl("info", {id : id}),
    header : header,
    method : "GET",
    dataType : "json",
    success : function(req){
      app.log(req)
      app.infoSuccessSync(req.data)
    },
    fail: function (req) {
      var req = {
        code: 100010,
        msg: "网络失败，请重试"
      };
      app.infoSuccessSync(req)
    }
  })
}

module.exports = info