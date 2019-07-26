//app.js
const appConfig = require('config')
App({
  onLaunch: function () {
    // 展示本地存储能力
    // 登录
    /*
    wx.login({
      success: res => {
        this.log("wx.login", res);
        // 发送 res.code 到后台换取 openId, sessionKey, unionId
      } 
    })
    var _this = this;
    wx.getNetworkType({
      success(res) {
        _this.globalData.networkType = res.networkType
        console.log(_this.globalData.networkType);
      },
      complete : function(res){
        console.log("complete", res);
      }
    })
    wx.onNetworkStatusChange(function (res) {
      console.log("res.isConnected", res.isConnected)
      console.log("res.networkType", res.networkType)
    })*/

    wx.getSystemInfo({
      success: e => {
        this.globalData.StatusBar = e.statusBarHeight;
        let custom = wx.getMenuButtonBoundingClientRect();
        this.globalData.Custom = custom;
        this.globalData.CustomBar = custom.bottom + custom.top - e.statusBarHeight;
      }
    })

    // 获取用户信息
    this.login();
  },
  login: function(){
    wx.getSetting({
      success: res => {
        if (res.authSetting['scope.userInfo']) {
          // 已经授权，可以直接调用 getUserInfo 获取头像昵称，不会弹框
          wx.login({
            success: res => {
              if (res.code && res.code != "") {
                this.globalData.code = res.code
                wx.getUserInfo({
                  success: res => {
                    // 可以将 res 发送给后台解码出 unionId
                    this.globalData.res = res;
                    this.globalData.userInfo = res.userInfo
                    // 由于 getUserInfo 是网络请求，可能会在 Page.onLoad 之后才返回
                    // 所以此处加入 callback 以防止这种情况
                    if (this.userInfoReadyCallback) {
                      this.userInfoReadyCallback(res)
                    }
                  },
                  fail: res => {
                    this.warning("网络错误，请检查您的网络是否正常~");
                  }
                });
              }else{
                this.warning("登录失败，请重新授权后登录～");
              }
            }
          });
        } else {
          //请先授权
        }
      }
    });
  },
  globalData: {
    code : null,
    userInfo: null,
    isReloadLists: false,
    isReloadIcon: false,
    info : null,
    res : null,
    background: "/images/theme/10001.jpg",
    networkType : "wifi"
  },
  toast : function(str)  {
    wx.showToast({
      title: str,
      duration: appConfig.duration
    });
  },
  warning : function(str) {
    wx.showModal({
      title: "温馨提示",
      content : str || "",
      showCancel : false,
    })
  },
  getStackTrace : function () {
    var obj = {};
    Error.captureStackTrace(obj, this.getStackTrace);
    return obj.stack;
  },
  log : function() {
    var stack = this.getStackTrace() || "";
    var matchResult = stack.split("at ");
    
    var line = matchResult[5] || ""
    for (var i in arguments) {
    }
    if (typeof arguments[i] == 'object') {
      arguments[i] = JSON.stringify(arguments[i])
    }
    arguments[i] += " " + line.replace("Object.", "").replace("(", "").replace(")", "");
    console.log.apply(console, arguments)
  },
})