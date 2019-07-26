const app = getApp();
const appConfig = require("../config");
const utils = require("../utils/util");
var album = function (_this, lastId, page, pageSize) {

  var header = {
    'content-type': 'application/x-www-form-urlencoded',
    'cookie': wx.getStorageSync(appConfig.storeKeys.sessionId)
  };
  wx.request({
    url: utils.getUrl("album", {lastId:lastId, page:page, pageSize: pageSize}),
    header: header,
    dataType: 'json',
    success: function (res) {
      wx.hideLoading();
      if (res.data.code > 0) {
        wx.showToast({
          title: res.data.msg || "获取公私钥失败",
          duration: appConfig.duration
        });
        return;
      }
      app.albumSync(res.data);
    },
    fail: function () {
      app.albumSync(appConfig.networkError);
      wx.hideLoading();
    }
  })
}

var remove = function(_this, uid, id, type) {
  var request = {};
  request.uid = uid;
  request.id = id;
  request.type = type;
  request.timestamp = new Date().getTime();
  request = utils.ksort(request);
  var str = utils.httpBuild(request);
  var sign = utils.hexSha1(str);
  request.sign = sign;
  delete request.uid;
  

  var header = {
    'content-type': 'application/x-www-form-urlencoded',
    'cookie': wx.getStorageSync(appConfig.storeKeys.sessionId)
  };
  wx.request({
    url: utils.getUrl("albumRemove", request),
    header: header,
    method: "GET",
    dataType: "json",
    success: function (req) {
      app.removeAlbumSync(req.data)
    },
    fail: function (req) {
      app.removeAlbumSync(appConfig.networkError)
    }
  })
}

module.exports = {
  lists: album,
  remove: remove
};