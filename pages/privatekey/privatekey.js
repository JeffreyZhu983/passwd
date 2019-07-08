const app = getApp()
const appConfig = require('../../config')
const common = require('../../common')
const utils = require('../../utils/util.js')

Page({

  /**
   * 页面的初始数据
   */
  data: {
    publicKey : "",
    privateKey : "",
    background : "",
  },
  inputAction: function (e) {
    var name = e.target.dataset.id;
    app.log(name, e.detail.value);
    var data = {};
    data[name] = e.detail.value;
    this.setData(data);
  },
  resetPrivateKey : function(){
    wx.navigateTo({
      url: '/pages/reset/reset',
    })
  },
  verifyPrivateKey: function(){
    if(this.data.publicKey == "" || this.data.privateKey == "") {
      app.warning("公私钥不能为空～")
      return;
    }
    var res = {
      code : 0, 
      msg: "恭喜您，您的公私钥校验成功！"
    };
    try{
      if (!utils.verifySslKey(this.data.publicKey, this.data.privateKey)) {
        res.code = 1;
        res.msg = "校验失败，您的公私钥不匹配，请查证后再试！";
      }
    }catch(e) {
      app.log(e);
      res.code = 400;
      res.msg = e;
    }

    app.verifyKeysSuccessSync(res);

    //common.verifyKeys(this.data.publicKey, this.data.privateKey);
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({
      background: utils.getBackground()
    });
    wx.setNavigationBarTitle({
      title: '验证私钥'
    });
    app.verifyKeysSuccessSync = res => {
      app.log(res)
      if(!res || (res.code && res.code > 0)) {
        app.warning(res.msg || "验证失败，请检查您的私钥～");
        return;
      }
      //验证成功有，将公私钥保存到sslKey和serverInfo

      //更新本地公私钥
      wx.setStorageSync(appConfig.storeKeys.sslKeys, { 'publicKey': this.data.publicKey, 'privateKey': this.data.privateKey });

      //更新serverInfo中用户的公私钥
      var serverInfo = wx.getStorageSync(appConfig.storeKeys.serverInfo);
      serverInfo.sslKeys = { 'publicKey': this.data.publicKey, 'privateKey': this.data.privateKey };
      app.log("更新 serverInfo", serverInfo);
      wx.setStorageSync(appConfig.storeKeys.serverInfo, serverInfo);
      wx.showModal({
        title: '温馨提示',
        content: '私钥校验成功',
        showCancel: false,
        success: function (item) {
          app.globalData.isReloadIcon = true;
          wx.navigateBack();
        }
      })
    }
    var serverInfo = wx.getStorageSync(appConfig.storeKeys.serverInfo);
    this.setData({
      "publicKey": utils.getPublicKey()
    });
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