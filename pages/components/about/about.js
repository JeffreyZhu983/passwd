const app = getApp()
const cache = require('../../../js/cache')
const appConfig = require('../../../config')
const utils = require('../../../utils/util')
const common = require('../../../common')

Component({
  properties: {
    switchToLocalText: {
      type: String,
      value: utils.getSwitchToLocalStatus() ? "切换到线上使用" : "切换到本地使用"
    }
  },
  options: {
    addGlobalClass: true,
  },
  data: {
    starCount: 0,
    forksCount: 0,
    visitTotal: 0,
    switchToLocalText: utils.getSwitchToLocalStatus() ? "切换到线上使用" : "切换到本地使用"
  },
  methods: {
    clearData: function () {
      try {
        wx.clearStorageSync();
        app.toast("清除成功");
      } catch (e) {
        app.toast("清空失败");
      }
    },
    showQrcode() {
      wx.previewImage({
        urls: ['https://www.travelzs.com/static/images/donating-weixin.jpg'],
        current: 'https://www.travelzs.com/static/images/donating-weixin.jpg' // 当前显示图片的http链接      
      })
    },
    switchToLocal: function(){
      var _this = this;
      app.syncRes = res => {
        if(res.code == 0) {
          var val = 0;
          if (!utils.getSwitchToLocalStatus()) {
            val = 1;
          }
          app.toast("同步成功~");
          wx.setStorageSync(appConfig.storeKeys.switchToLocal, val);
          _this.setData({
            "switchToLocalText": utils.getSwitchToLocalStatus() ? "切换到线上使用" : "切换到本地使用"
          });
        }else{
          app.warning("同步失败~");
        }
      }
      //如果用户未登录，要求用户先登录
      if (!utils.hasLogined() && !utils.getSwitchToLocalStatus()){
        app.warning("请登录后再切换，否则无法同步数据～");
        return;
      }
      if(utils.getSwitchToLocalStatus()) {
        wx.showModal({
          title: '温馨提示',
          content: '切换到线上后，数据将会在多台设备同步，点击确认将实时同步数据',
          success: function (item) {
            if (item.confirm) {
              cache.sync();
            }
          }
        })
        return;
      }
      wx.showModal({
        title: '温馨提示',
        content: '切换到本地后，只能保存数据到本地，如果需要多台设备同步，请实时同步数据',
        success: function(item){
            if(item.confirm){
              cache.sync();
            }
        }
      })
    },
  }
})