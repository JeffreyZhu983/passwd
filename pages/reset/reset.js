// pages/keys/keys.js
const app = getApp()
const appConfig = require('../../config');
const common = require('../../common');
const utils = require('../../utils/util');
Page({
  /**
   * 页面的初始数据
   */
  data: {
    publicKey: "",
    privateKey: "",
    opt: "",
    background: "",
  },
  textareaAInput : function(e){
    var name = e.target.dataset.id;
    app.log(name, e.detail.value);
    var data = {};
    data[name] = e.detail.value;
    this.setData(data);
  },
  resetPrivateKey: function () {
    var _this = this;
    
    wx.showModal({
      title: '是否要重置公私钥',
      content: '公私钥将重新生成，您保存的密码将无法解密，请确认是否要进行操作',
      confirmText: '重置',
      success: function (item) {
        if (item.confirm) {
          var sslKeys = utils.genSslKey();
          common.saveClientPublicKey(_this, sslKeys['publicKey'], sslKeys['privateKey'])
        }
      }
    })
    
  },
  savePrivateKey: function () {//直接保存用户生成密钥，需要校验公私钥
    var _this = this;
    //校验公私钥
    if (!utils.verifySslKey(_this.data.publicKey, _this.data.privateKey)) {
      app.warning("您的公私钥不匹配，请查证后再试~");
      return;
    }
    wx.showModal({
      title: '是否要使用自己公私钥',
      content: '公私钥保存后，您保存的密码可能无法解密，请确认是否要进行操作',
      confirmText: '保存',
      success: function (item) {
        if (item.confirm) {
          common.saveClientPublicKey(_this, _this.data.publicKey, _this.data.privateKey)
        }
      }
    })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var _this = this;
    _this.setData({
      background: utils.getBackground()
    });
    wx.setNavigationBarTitle({
      title: '重置私钥'
    });
    var serverInfo = wx.getStorageSync("serverInfo");
    this.setData({
      publicKey: utils.getPublicKey(),
      privateKey: utils.getPrivateKey(),
    });
    app.sslKeySaveSync = res => {
      if(!res || (res.code && res.code > 0)){
        app.warning(res.msg || "更新失败");
        return;
      }
      app.log('sslKeySaveSync', res);
      this.data.publicKey = res.data.publicKey;
      this.data.privateKey = res.data.privateKey;
      this.setData({
        publicKey : this.data.publicKey,
        privateKey : this.data.privateKey
      });
      //更新本地公私钥
      wx.setStorageSync(appConfig.storeKeys.sslKeys, { 'publicKey': this.data.publicKey, 'privateKey': this.data.privateKey });

      //更新serverInfo中用户的公私钥
      var serverInfo = wx.getStorageSync(appConfig.storeKeys.serverInfo);
      serverInfo.sslKeys = { 'publicKey': this.data.publicKey, 'privateKey': this.data.privateKey };
      app.log("更新 serverInfo", serverInfo);
      wx.setStorageSync(appConfig.storeKeys.serverInfo, serverInfo);
      app.globalData.isReloadLists = true;
      
      wx.showModal({
        title: '温馨提示',
        content: '请将您的私钥拷贝出来保存到一个安全的地方（点击确定内容将自动复制），以供以后恢复密码使用～',
        success:function(item){
          if(item.confirm) {
            wx.setClipboardData({
              data: _this.data.privateKey,
              success: function (res) {
                wx.getClipboardData({
                  success: function (res) {
                  }
                });
              },
              fail: function () {
                app.toast("复制失败");
              }
            });
          }
        }
      });
      app.globalData.isReloadIcon = true;
    }
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {
    common.genKeys(this);
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})