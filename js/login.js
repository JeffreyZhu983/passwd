const app = getApp();
const appConfig = require("../config");
const utils = require("../utils/util");

var login = function (that) {
  var serverInfo = wx.getStorageSync(appConfig.storeKeys.serverInfo);
  if(serverInfo && typeof serverInfo == 'object'
    && serverInfo['openId'] && serverInfo['openId'] != "" 
    && serverInfo['sessionId'] && serverInfo['sessionId'] != "") {
    //如果是切换到本地就不去发请求，直接成功
    if (utils.getSwitchToLocalStatus) {
      that.setData({
        motto: "登录成功",
        showLists: true,
        hasServerInfo: true,
        hiddenStatus: true
      });
      app.serInfoReady({
        code: 0,
        msg: "本地登录成功~",
        data: {
          sslKeys: {}
        }
      })
      return;
    }

    var header = {
      'content-type': 'application/x-www-form-urlencoded',
    };
      wx.request({
        url: utils.getUrl("login"),
        header: header,
        data : {
          openId: serverInfo['openId'],
          sessionId: serverInfo['sessionId'],
        },
        method : "POST",
        dataType : "json",
        success: function(req) {
          //解密用户信息后登录
          if (!req || req.data.code > 0 || !req.data.data || !req.data.data.sslKeys) {
            //登录失败
            app.serInfoReady(req.data);
            setTimeout(function () {
              wx.hideLoading();
            }, 3000);
            return;
          } else {
            //登录成功，将用户信息加密保存到本地
            wx.showToast({
              title: '登录成功',
            })
          }
          wx.setStorageSync(appConfig.storeKeys.sessionId, req.header["Set-Cookie"])
          wx.setStorageSync(appConfig.storeKeys.serverInfo, req.data.data)

          that.setData({
            motto: "登录成功",
            showLists: true,
            hasServerInfo: true,
            hiddenStatus: true
          });
          if (req.data.data.sslKeys && req.data.data.sslKeys.publicKey && req.data.data.sslKeys.publicKey != "") {
            that.setData({
              hasPublicKey: true
            });
            app.globalData.hasPublicKey = true;
          }
          wx.hideToast();
          wx.hideLoading();
          app.serInfoReady(req.data)
        },
        fail: function (res) {
          app.serInfoReady(appConfig.networkError);
        }
    });
    return;
  }
  //如果有openId 和 sessionId 就直接登录，不走获取微信信息
  wx.getSetting({
    success(res) {
      app.log("wx.getSetting", res);
      if (res.authSetting['scope.userInfo']) {
        if (!app.globalData.res) {
          app.warning("用户信息获取失败");
          return;
        }
        if (app.globalData.code == null) {
          app.warning("登录授权码获取失败～");
          return;
        }
        wx.showLoading({
          title: '正在登录',
        });

        var header = {
          'content-type': 'application/x-www-form-urlencoded',
        };

        wx.request({
          url: utils.getUrl("auth"),
          data: {
            code: app.globalData.code,
            encryptedData: app.globalData.res.encryptedData,
            iv: app.globalData.res.iv
          },
          header: header,
          method: 'POST',
          dataType: 'json',
          success: function (req) {
            //解密用户信息后登录
            if (!req || req.data.code > 0 || !req.data.data || !req.data.data.sslKeys) {
              //登录失败
              app.serInfoReady(req.data);
              setTimeout(function () {
                wx.hideLoading();
              }, 3000);
              return;
            } else {
              //登录成功，将用户信息加密保存到本地
              wx.showToast({
                title: '登录成功',
              })
            }
            wx.setStorageSync(appConfig.storeKeys.sessionId, req.header["Set-Cookie"])
            wx.setStorageSync(appConfig.storeKeys.serverInfo, req.data.data)

            that.setData({
              motto: "登录成功",
              showLists: true,
              hasServerInfo: true,
              hiddenStatus: true
            });
            if (req.data.data.sslKeys && req.data.data.sslKeys.publicKey && req.data.data.sslKeys.publicKey != "") {
              that.setData({
                hasPublicKey: true
              });
              app.globalData.hasPublicKey = true;
            }
            wx.hideToast();
            wx.hideLoading();
            app.serInfoReady(req.data)
          },
          fail: function (res) {
            app.serInfoReady(appConfig.networkError);
          }
        });
      }else{
        app.warning("请先授权此应用访问您的基本信息");
      }
    }
  });
  
}

module.exports = login