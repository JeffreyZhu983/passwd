// pages/password/password.js
const app = getApp()
const appConfig = require('../../config');
const common = require('../../common');
const rand = require('../../js/rand');
const utils = require('../../utils/util');
const cache = require('../../js/cache');

Page({

  /**
   * 页面的初始数据
   */
  data: {
    id: "",
    name: "",
    password: "",
    account: "",
    link: "",
    note: "",
    pubKey: "",
    background: "",
    isEdit : false,
    passwordLength : 12,
  },
  inputAction: function(e) {
    var name = e.target.dataset.id;
    var data = {};
    app.log(name);
    if (name == 'passwordLength') {
      if(e.detail.value < 6) {
        data[name] = 6;
        this.setData(data);
        return;
      }
    }
    data[name] = e.detail.value;
    this.setData(data);
  },
  getBack: function() {
    wx.navigateBack();
  },
  randPassword: function() {
    var passwd = rand.randCombin("alpha,smallLetter,bigLetter,specialChars", this.data.passwordLength, true);
    app.log('password', passwd);
    this.setData({
      password: passwd
    });
  },
  minusLength: function(){
    if(this.data.passwordLength <= 6) {
      return;
    }
    this.data.passwordLength = this.data.passwordLength - 1;
    this.setData({
      passwordLength: this.data.passwordLength
    });
    this.randPassword();
  },
  addLength: function () {
    if(this.data.passwordLength >= 32) {
      return;
    }
    this.data.passwordLength = this.data.passwordLength + 1;
    this.setData({
      passwordLength: this.data.passwordLength
    });
    this.randPassword();
  },
  submitPassword: function() {
    var submitData = {};
    submitData.id = this.data.id;
    submitData.name = this.data.name;
    submitData.account = this.data.account;
    submitData.password = this.data.password;
    submitData.link = this.data.link;
    submitData.note = this.data.note;
    submitData.pubKey = this.data.pubKey;
    submitData.isEdit = this.data.isEdit;
    app.log("submitData", submitData);
    common.savePwd(this, submitData);
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    this.setData({
      background: utils.getBackground()
    });
    wx.setNavigationBarTitle({
      title: '创建我的密码'
    });
    var serverInfo = wx.getStorageSync("serverInfo");
    app.sslKeyDecryptSync = res => {
      app.log(res)
      this.setData(app.globalData.info, utils.getPrivateKey());
      if (!res || (res.code && res.code > 0)) {
        app.warning(res.msg || "解密失败，请确认您的私钥是否正确～");
        this.setData({
          password: "",
        });
        return;
      }
      this.setData({
        password: res.data.password
      });
    }
    app.storeSuccess = res => {
      if (!res || (res.code && res.code > 0)) {
        app.warning(res.msg || "保存失败");
        return;
      }
      //如果是线上的话就编辑本地数据
      if (!utils.getSwitchToLocalStatus()) {
        cache.editSingle(res.data);
      }
      wx.showModal({
        title: '温馨提示',
        content: res.msg || "保存成功",
        showCancel: false,
        success: function(item) {
          if (item.confirm) {
            app.globalData.isReloadLists = true;
            setTimeout(function() {
              wx.navigateBack();
            }, appConfig.duration);
          }
        }
      })
    }
    app.log("serverInfo", serverInfo)
    if (app.globalData.info != null && typeof app.globalData.info == 'object') {
      //去掉服务端解密过程
      //common.decrypt(app.globalData.info.password, serverInfo.sslKeys.privateKey);
      var res = { "code": 0, "msg": "解密成功" };
      try {
        var decrypt = utils.sslDecrypt(app.globalData.info.password, serverInfo.sslKeys.privateKey)
        if (decrypt == false) {
          res = { "code": 1, "msg": "解密失败，请检查您的私钥及密码串～" };
        } else {
          res.data = { password: decrypt };
        }
      } catch (e) {
        res.code = 400;
        res.msg = "解密失败，请检查您的私钥及密码串～";
      }
      app.sslKeyDecryptSync(res);

      wx.setNavigationBarTitle({
        title: '编辑我的密码',
      });
      this.setData({
        isEdit : true
      });
      app.log("app.globalData.info", typeof app.globalData.info);
    }
    this.setData({
      'pubKey': serverInfo.sslKeys.publicKey
    });
  },
  SetShadow(e) {
    this.setData({
      shadow: e.detail.value
    })
  },
  SetBorderSize(e) {
    this.setData({
      bordersize: e.detail.value
    })
  },
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function() {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function() {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function() {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function() {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function() {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function() {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function() {

  }
})