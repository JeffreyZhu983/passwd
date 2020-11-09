//index.js
//获取应用实例
const app = getApp()
const appConfig = require('../../config');
const common = require('../../common');
const utils = require('../../utils/util');
const cache = require('../../js/cache');

Page({
  data: {
    title : "密码本",
    motto: '请点击上边图标以授权此应用',
    userInfo: {},
    hiddenStatus: false,
    showLists: false,
    hasUserInfo: false,
    canIUse: wx.canIUse('button.open-type.getUserInfo'),
    serverInfo: null,
    hasServerInfo: false,
    PageCur: 'passwd-note',
    lists: null,
    pages: null,
    hasPublicKey: false,
    iconCls: 3,
    background: "",
    switchToLocalText: "",
    colors: ["bg-yellow", "bg-green", "bg-olive", "bg-green", "bg-cyan", "bg-blue", "bg-purple", "bg-mauve", "bg-pink", "bg-brown", "bg-grey", "bg-black"],
    isLoad: false,
    cardCur: 0,
    DotStyle: "square-dot",
    keyword:"",
    swiperList: [{
      id: 0,
      type: 'image',
      url: '/images/theme/10001.jpg'
    }, {
      id: 1,
      type: 'image',
        url: '/images/theme/10002.jpg',
    }, {
      id: 2,
      type: 'image',
        url: '/images/theme/10003.jpg'
    }, {
      id: 3,
      type: 'image',
        url: '/images/theme/10004.jpg'
    }, {
      id: 4,
      type: 'image',
        url: '/images/theme/10005.jpg'
    }, {
      id: 5,
      type: 'image',
        url: '/images/theme/10006.jpg'
    }, {
      id: 6,
      type: 'image',
        url: '/images/theme/10007.jpg'
    }],
    imgList:[],
    albumList:{
      "pages" : {
        "totalPage" : 0,
        "currentPage" : 0,
      },
      "lists" : []
    }
  },
  NavChange(e) {
    var _this = this;

    this.setData({
      PageCur: e.currentTarget.dataset.cur,
      switchToLocalText: utils.getSwitchToLocalStatus() ? "切换到线上使用" : "切换到本地使用"
    });
    if (e.currentTarget.dataset.cur == 'album') {
      this.setData({
        'title' : '我的相册'
      });
      this.album = this.selectComponent("#album");
    }else{
      this.setData({
        'title' : '密码本'
      });
    }
  },
  showModal(e) {
    this.setData({
      modalName: e.currentTarget.dataset.target
    })
  },
  hideModal(e) {
    this.setData({
      modalName: null
    })
  },
  gridchange: function(e) {
    this.setData({
      gridCol: e.detail.value
    });
  },
  gridswitch: function(e) {
    this.setData({
      gridBorder: e.detail.value
    });
  },
  menuBorder: function(e) {
    this.setData({
      menuBorder: e.detail.value
    });
  },
  menuArrow: function(e) {
    this.setData({
      menuArrow: e.detail.value
    });
  },
  menuCard: function(e) {
    this.setData({
      menuCard: e.detail.value
    });
  },
  switchSex: function(e) {
    this.setData({
      skin: e.detail.value
    });
  },

  // ListTouch触摸开始
  ListTouchStart(e) {
    this.setData({
      ListTouchStart: e.touches[0].pageX
    })
  },

  // ListTouch计算方向
  ListTouchMove(e) {
    this.setData({
      ListTouchDirection: e.touches[0].pageX - this.data.ListTouchStart > 0 ? 'right' : 'left'
    })
  },

  // ListTouch计算滚动
  ListTouchEnd(e) {
    if (this.data.ListTouchDirection == 'left') {
      this.setData({
        modalName: e.currentTarget.dataset.target
      })
    } else {
      this.setData({
        modalName: null
      })
    }
    this.setData({
      ListTouchDirection: null
    })
  },
  onPullDownRefresh: function () {
    if (this.data.PageCur == 'album') {
      this.album.onPullDownRefresh();
      return;
    }
    if (this.data.PageCur != 'passwd-note') {
      return;
    }
    this.setData({
      isLoad: false,
      hiddenLoading: false,
    });
    wx.showNavigationBarLoading();
    common.lists(this, 1, appConfig.pageSize, this.data.keyword);
    wx.stopPullDownRefresh();
  },
  onReachBottom: function () {
    if (this.data.PageCur == 'album') {
      this.album.onReachBottom();
      return;
    }
    if (this.data.PageCur != 'passwd-note') {
      this.setData({
        "onReachBottom": true,
      });
      return;
    }
    if(!this.data.pages) {
        return;
    }
    if (this.data.pages.currentPage < this.data.pages.totalPage) {
      this.setData({
        hiddenLoading: false,
      });
      //加载下一页
      common.lists(this, parseInt(this.data.pages.currentPage) + 1, appConfig.pageSize, this.data.keyword);
    }
  },
  setToBackground: function(e){
    var url = e.target.dataset.src;
    this.setData({
      "background" : url
    });
    app.globalData.background = url;
    utils.setBackground(url);
  },
  //事件处理函数
  bindViewTap: function() {
    if (!utils.hasLogined()) {
      this.reLogin();
    }
  },
  clickItem: function (e) {
    var _this = this;
    var method = e.target.dataset.id;
    switch (method) {
      case "add-password":
        if (!utils.hasLogined()) {
          wx.showModal({
            title: '温馨提示',
            content: '您尚未登录，请登录后再试~',
            success: function(item) {
                if(item.confirm) {
                  _this.reLogin();
                }
            }
          })
          return;
        }
        if (!utils.hasPublicKey()) {
          wx.navigateTo({
            url: '../keys/keys?to=' + encodeURIComponent("../password/password"),
          })
          return;
        }
        wx.navigateTo({
          url: '../password/password',
        });
        break;
      case "request-ssl-key":
        if (!utils.hasLogined()) {
          wx.showModal({
            title: '温馨提示',
            content: '您尚未登录，请登录后再试~',
            success: function (item) {
              if (item.confirm) {
                _this.reLogin();
              }
            }
          })
          return;
        }
        wx.navigateTo({
          url: '../keys/keys',
        });
        break;
      case "reset-ssl-key":
        if (!utils.hasLogined()) {
          wx.showModal({
            title: '温馨提示',
            content: '您尚未登录，请登录后再试~',
            success: function (item) {
              if (item.confirm) {
                _this.reLogin();
              }
            }
          })
          return;
        }
        if (!utils.hasPublicKey()) {
          wx.navigateTo({
            url: '../keys/keys?to=' + encodeURIComponent("../keys/keys"),
          })
          return;
        }
        wx.navigateTo({
          url: '../reset/reset',
        });
        break;
      case 'save-to-local':
        cache.download(1, 10000);
      break;
    }
  },
  onShow: function() {
    app.globalData.info = null;
    if (app.globalData.isReloadLists) {
      this.setData({
        hiddenLoading: false,
      });
      common.lists(this, 1, appConfig.pageSize, this.data.keyword);
      app.globalData.isReloadLists = false;
    }
    if (app.globalData.isReloadIcon) {
      this.reloadIcon(false);
      app.globalData.isReloadIcon = false;
    }
    this.setData({
      "switchToLocalText": utils.getSwitchToLocalStatus() ? "切换到线上使用" : "切换到本地使用"
    });

  },
  reLogin: function() {
    app.login();
  },
  inputAction: function(e){
    var name = e.target.dataset.id;
    var data = {};
    data[name] = e.detail.value;
    this.setData(data);
  },
  search: function(e) {
    common.lists(this, 1, appConfig.pageSize, this.data.keyword)
  },
  editPwd: function(e) {
    var _this = this;
    app.infoSuccessSync = res => {
      if (!res || (res.code && res.code > 0)) {
        app.toast(res.msg || "获取失败");
        return;
      }
      app.globalData.info = res.data;
      wx.navigateTo({
        url: '/pages/password/password?id=' + res.data.id,
      })
    }
    if (!utils.syncServerInfo()) {
      wx.showModal({
        title: '温馨提示',
        content: '您尚未登录，请登录后再试~',
        success: function (item) {
          if (item.confirm) {
            _this.reLogin();
          }
        }
      })
      return;
    }else if(!utils.hasPublicKey() && !utils.hasPrivateKey()){
      wx.showModal({
        title: '温馨提示',
        content: '请先生成您的公私钥以便加解密密码',
        showCancel: false,
        success: function (item) {
          wx.navigateTo({
            url: '/pages/keys/keys',
          })
        }
      })
    } else if (!utils.hasPrivateKey()) {
      wx.showModal({
        title: '温馨提示',
        content: '请输入您的私钥以解密您的密码',
        showCancel: false,
        success: function(item) {
          wx.navigateTo({
            url: '/pages/privatekey/privatekey',
          })
        }
      })
      return;
    }
    var id = e.target.dataset.id;
    common.info(id);
  },
  removePwd: function(e) {
    var id = e.target.dataset.id;
    var name = e.target.dataset.name;
    app.removeSuccessSync = res => {
      if (!res || (res.code && res.code > 0)) {
        app.warning(res.msg || "删除失败");
        return;
      }
      wx.showModal({
        title: '温馨提示',
        content: '删除成功',
        showCancel: false,
        success: function(item) {}
      });
      for (var i in this.data.lists) {
        var list = this.data.lists[i];
        if (list.id == id) {
          this.data.lists.splice(i, 1);
        }
      }
      this.setData({
        lists: this.data.lists
      })
    }
    wx.showModal({
      title: '温馨提示',
      content: '数据一旦删除无法恢复，请确认是否要删除～',
      success: function(item) {
        if (item.confirm) {
          common.remove(id, name)
        }
      }
    });
  },
  copyPwd: function(e) {
    var _this = this;
    if(!utils.hasLogined()){
      wx.showModal({
        title: '温馨提示',
        content: '您尚未登录，请登录后再试~',
        success: function (item) {
          if (item.confirm) {
            _this.reLogin();
          }
        }
      })
      return;
    }
    if (!utils.hasPrivateKey()) {
      wx.showModal({
        title: '温馨提示',
        content: '请输入您的私钥以解密您的密码',
        success: function(item) {
          if(item.confirm) {
            wx.navigateTo({
              url: '/pages/privatekey/privatekey',
            })
          }
        }
      })
      return;
    }
    var str = e.target.dataset.val;
    if (!str || str == '') {
      app.warning("解密的密码不能为空～");
      return;
    }

    app.sslKeyDecryptSync = res => {
      if (!res ||  (res.code && res.code > 0)) {
        app.warning(res.msg || "解密失败");
        return;
      }
      var password = res.data.password;
      wx.showModal({
        title: '解密成功',
        content: '您的密码是:' + password,
        confirmText: '复制',
        success: function(item) {
          if (item.confirm) {
            wx.setClipboardData({
              data: password,
              success: function(res) {
                wx.getClipboardData({
                  success: function(res) {
                  }
                });
              },
              fail: function(){
                app.toast("复制失败");
              }
            });
          }
        }
      })

    }
    var res = { "code": 0, "msg": "解密成功" };
    try{
      var decrypt = utils.sslDecrypt(str, utils.getPrivateKey())
      if (decrypt == false) {
        res = { "code": 1, "msg": "解密失败，请检查您的私钥及密码串～" };
      } else {
        res.data = { password: decrypt };
      }
    }catch(e){
      res.code = 400;
      res.msg = "解密失败，请检查您的私钥及密码串～";
    }
    app.sslKeyDecryptSync(res);
    //去掉网络请求
    //utils.decrypt(str, utils.getPrivateKey());
  },
  reloadIcon: function(loadList) {
    var _this = this;
    if (!utils.syncServerInfo()) {
      wx.showModal({
        title: '温馨提示',
        content: '您尚未登录，请登录后再试~',
        success: function (item) {
          if (item.confirm) {
            _this.reLogin();
          }
        }
      })
      return;
    } else if (!utils.hasPublicKey() && !utils.hasPrivateKey()){
      wx.showModal({
        title: '温馨提示',
        content: '请先生成您的公私钥以便加解密密码',
        success: function (item) {
          if (item.confirm) {
            wx.navigateTo({
              url: '/pages/keys/keys',
            })
          }
        }
      });
    } /*else if (!utils.hasPrivateKey()) {
      wx.showModal({
        title: '温馨提示',
        content: '请输入您的私钥以解密您的密码',
        success: function(item) {
          if (item.confirm) {
            wx.navigateTo({
              url: '/pages/privatekey/privatekey',
            })
          }
        }
      });
    }*/
    if (utils.hasPublicKey()) {
      this.setData({
        'iconCls': appConfig.noPublicKeyIcon.length,
        'iconList': appConfig.noPublicKeyIcon
      });
    }
    if (utils.syncServerInfo() && loadList) {
      this.setData({
        hiddenLoading: false,
      });
      common.lists(this, 1, appConfig.pageSize, this.data.keyword)
    }
  },
  onLoad: function() {
    var _this = this;

    app.syncRes = res => {
      if (res.code == 0) {
        app.toast("同步成功~");
      }else{
        app.warning("同步失败~");
      }
    }
    app.listSync = res => {
      if(!res || !res.pages) {
        app.warning(res.msg || "获取数据失败");
        if (res.code == '40001') {
          _this.reLogin();
        }
        return;
      }
      this.setData({
        hiddenLoading : true,
      });
      setTimeout(function () {
        wx.hideNavigationBarLoading();
      }, 1000);
      if (res.pages.currentPage == res.pages.totalPage) {
        this.setData({
          "isLoad" : true
        });
        this.setData({
          hiddenLoading: false,
        });
      }
      var lists = [];
      if(res.pages.currentPage == 1) {
        lists = res.lists;
      }else{
        lists = this.data.lists;
        for (var i in res.lists) {
          lists.push(res.lists[i]);
        }
      }
      this.setData({
        lists: lists,
        pages: res.pages
      });
    }
    //同步数据回调
    app.syncSuccess = res => {
      if(!res || res.code > 0) {
        app.warning(res.msg || "同步失败");
        return;
      }

      app.toast("同步成功");
      if (utils.getSwitchToLocalStatus) {
        common.lists(this, 1, appConfig.pageSize, this.data.keyword);
      }
    }
    //保存数据到本地回调
    app.storeToLocal = res => {
    }

    app.serInfoReady = res => {
      var _this = this;
      if (!res || res.code > 0 || !res.data || !res.data.sslKeys) {
        if (res.code == 10005) {
          //删除本地登录信息，重新登录
          wx.clearStorageSync();
        }
        wx.showModal({
          title: '温馨提示',
          content: res.msg || "登录失败，请重试 ~",
          showCancel: false,
          success: function(item) {
            _this.reLogin();
          }
        })
        return;
      }
      this.reloadIcon(true);
    }

    app.globalData.serverInfo = utils.syncServerInfo();
    app.globalData.hasPublicKey = utils.hasPublicKey();
    if (utils.hasPublicKey()) {
      this.setData({
        'iconCls': appConfig.noPublicKeyIcon.length,
        'iconList': appConfig.noPublicKeyIcon
      });
    } else {
      this.setData({
        'iconCls': appConfig.iconList.length,
        "iconList": appConfig.iconList
      });
    }
    if (app.globalData.userInfo) {
      this.setData({
        userInfo: app.globalData.userInfo,
        hasUserInfo: true
      });
      common.login(this);
    } else if (this.data.canIUse) {
      // 由于 getUserInfo 是网络请求，可能会在 Page.onLoad 之后才返回
      // 所以此处加入 callback 以防止这种情况
      app.userInfoReadyCallback = res => {
        app.globalData.res = res
        common.login(this)
        this.setData({
          motto: "正在登录，请稍后...",
          userInfo: res.userInfo,
          hasUserInfo: true,
        })
      }
    } else {
      this.reLogin();
    }

    this.setData({
      background: utils.getBackground()
    });
  },
  getUserInfo: function(e) {
    if(!e.detail.userInfo){
      app.warning("获取用户信息失败，请先授权此应用访问您的基本信息～");
      return;
    }
    /*
    app.globalData.userInfo = e.detail.userInfo;
    app.globalData.res = e.detail;
    this.setData({
      userInfo: e.detail.userInfo,
      hasUserInfo: true
    })
    common.login(this)*/
    app.login();
  },
  onShareAppMessage() {
    return {
      title: 'mobi密码本，您的密码守护专家',
      imageUrl: '/images/share.png',
      path: '/pages/index/index'
    }
  },
})