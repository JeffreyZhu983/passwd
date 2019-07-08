// pages/keys/keys.js
const app = getApp()
const appConfig = require('../../config');
const common = require('../../common');
Page({

  /**
   * 页面的初始数据
   */
  data: {
    publicKey : "",
    privateKey : "",
    background: "",
  },
  savePrivateKey : function(){
    if(this.data.publicKey != "" && this.data.privateKey != ""){
      common.saveKeys(this)
    }
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var _this = this;
    _this.setData({
      background: common.getBackground()
    });
    wx.setNavigationBarTitle({
      title: '创建公私钥'
    });
    //如果已经有公私钥了就退出当前页面

    var sslKeys = wx.getStorageSync(appConfig.storeKeys.sslKeys)
    var serverInfo = wx.getStorageSync(appConfig.storeKeys.serverInfo)
    if (serverInfo['sslKeys'] && sslKeys['publicKey'] == serverInfo['sslKeys']['publicKey']){
      wx.showModal({
        title: '温馨提示',
        content: '您已经创建了公私钥，如果丢失，请重置公私钥～',
        success: function(item){
          app.globalData.isReloadIcon = true;
          wx.navigateBack();
        }
      })
      return;
    }
    app.sslKeyRequestSync = res => {
      if (res && res.code == 0) {
        _this.setData({
          publicKey: res.data.publicKey,
          privateKey: res.data.privateKey,
        });
      }else if(res && res.code == 5) {
        //force update
      }
    }
    app.sslKeySaveSync = res => {
      app.log('sslKeySaveSync', res);
      //保存公私钥到本地
      wx.setStorageSync(appConfig.storeKeys.sslKeys, { 'publicKey': this.data.publicKey, 'privateKey': this.data.privateKey });
      //更新serverInfo中用户的公私钥
      var serverInfo = wx.getStorageSync(appConfig.storeKeys.serverInfo);
      serverInfo.sslKeys = { 'publicKey': this.data.publicKey, 'privateKey': this.data.privateKey };
      wx.setStorageSync(appConfig.storeKeys.serverInfo, serverInfo);
      app.globalData.isReloadIcon = true;
      wx.showModal({
        title: '温馨提示',
        content: res.msg || "保存成功",
        showCancel: false,
        success: function(item){
          wx.navigateBack();
        }
      })
    }
    common.genKeys(this);
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