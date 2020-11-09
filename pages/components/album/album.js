// pages/components/album/album.js
const app = getApp();
const common = require('../../../common');
const utils = require("../../../utils/util");
const appConfig = require("../../../config");
const wxUploadFile = utils.promisify(wx.uploadFile);

Component({
  options: {
    addGlobalClass: true,
  },
  /**
   * 组件的属性列表
   */
  properties: {
    albumList: Object
  },

  /**
   * 组件的初始数据
   */
  data: {
    imgList: [],
    albumList: {
      "pages": {
        "totalPage": 0,
        "currentPage": 0,
      },
      "lists": []
    },
    bgColor: [
      "grey",
      "blue",
      "red",
      "cyan"
    ],
    pics: [],
    isLoad: false,
    lastId: 0,
  },
  ready: function () {
    var _this = this;
    this.loadAlbum(_this, this.data.lastId, 1, appConfig.pageSize);
  },
  /**
   * 组件的方法列表
   */
  methods: {
    setDefaultAlbum() {
      this.setData({
        albumList: {
          "pages": {
            "totalPage": 0,
            "currentPage": 0,
          },
          "lists": []
        },
        lastId: 0,
      });
    },
    onPullDownRefresh() {
      wx.showNavigationBarLoading();
      this.setDefaultAlbum();
      this.loadAlbum(this, 0, 1, appConfig.pageSize);
      wx.stopPullDownRefresh();
    },
    onReachBottom() {
      if (!this.data.albumList.pages) {
        return;
      }
      if (this.data.albumList.pages.currentPage < this.data.albumList.pages.totalPage) {
        this.setData({
          hiddenLoading: false,
        });
        //加载下一页
        this.loadAlbum(this, this.data.lastId, parseInt(this.data.albumList.pages.currentPage) + 1, appConfig.pageSize);
      }
    },
    loadAlbum(_this, lastId, page, pageSize) {
      this.data.lastId = lastId;
      this.setData({
        "isLoad": false
      });
      app.albumSync = res => {
        this.setData({
          hiddenLoading: true,
        });
        var showRes = this.data.albumList;
        if (parseInt(res.pages.currentPage) == 1) {
          this.data.pics = [];
          showRes = res;
          for (var i in res.lists) {
            this.data.pics.push(res.lists[i].source);
          }
        }else{
          showRes['pages'] = res.pages;
          for (var i in res.lists) {
            this.data.lastId = res.lists[i].id;
            this.data.pics.push(res.lists[i].source);
            showRes.lists.push(res.lists[i]);
          }
        }

        _this.setData({
          albumList: showRes
        });

        if (res.pages.currentPage == res.pages.totalPage || res.pages.totalPage == 0) {
          this.setData({
            "isLoad": true
          });
          this.setData({
            hiddenLoading: false,
          });
        }
      }
      common.album(this, this.data.lastId, page, pageSize)
    },
    showPic(e) {
      var pics = [e.target.dataset.source, e.target.dataset.src];
      var index = e.target.dataset.index;

      wx.previewImage({
        urls: this.data.pics,
        current: pics[0] // 当前显示图片的http链接      
      })
    },
    remove(e){
      var _this = this;
      var uid = e.target.dataset.uid;
      var id = e.target.dataset.id;
      var type = e.target.dataset.type;
      app.removeAlbumSync = res =>{
        if(typeof res != 'object') {
          app.toast("删除失败");
          return;
        }
        if(res.code > 0){
          app.toast(res.msg || "删除失败");
          return;
        }

        app.toast("删除成功");
        setTimeout(function(){
          _this.setDefaultAlbum();
          _this.loadAlbum(_this, 0, 1, appConfig.pageSize);
        }, 1500);
      }
      wx.showModal({
        title: '温馨提示',
        content: '是否要永久删除此照片',
        success: function(item){
          if (item.confirm) {
            common.albumRemove(this, uid, id, type);
          }
        }
      })
    },
    ChooseImage() {
      wx.chooseImage({
        count: 8, //默认9
        sizeType: ['original', 'compressed'], //可以指定是原图还是压缩图，默认二者都有
        sourceType: ['album'], //从相册选择
        success: (res) => {
          if (this.data.imgList.length != 0) {
            this.setData({
              imgList: this.data.imgList.concat(res.tempFilePaths)
            })
          } else {
            this.setData({
              imgList: res.tempFilePaths
            })
          }
        }
      });
    },
    ViewImage(e) {
      wx.previewImage({
        urls: this.data.imgList,
        current: e.currentTarget.dataset.url
      });
    },
    DelImg(e) {
      wx.showModal({
        title: '召唤师',
        content: '确定要删除这段回忆吗？',
        cancelText: '再看看',
        confirmText: '再见',
        success: res => {
          if (res.confirm) {
            this.data.imgList.splice(e.currentTarget.dataset.index, 1);
            this.setData({
              imgList: this.data.imgList
            })
          }
        }
      })
    },
    submitForm: function() {
      var _this = this;
      if (this.data.imgList.length == 0) {
        app.warning("请选择您要上传的文件~");
        return;
      }
      wx.showLoading({
        title: '上传中',
      });
      var header = {
        'content-type': 'multipart/form-data',
        'cookie': wx.getStorageSync(appConfig.storeKeys.sessionId)
      };
      var url = utils.getUrl("albumUpload");
      var success = 0;
      var fail = 0;
      const arr = this.data.imgList.map(path => {
        return wxUploadFile({
          url: url,
          header: header,
          filePath: path,
          name: 'file[]'
        });
      });
      Promise.all(arr).then(res => {
        return res.map(item => JSON.parse(item.data).data.files[0]);
      }).catch(err => {
        app.warning("上传文件失败~");
        wx.hideLoading();
      }).then(res => {
          return res;
        }).then(res => {
          var success = 0;
          var fail = 0;
          for(var i in res) {
            if(res[i].code == 0){
              success++;
            }else{
              fail++;
            }
          }
          wx.hideLoading();
          if(fail > 0) {
            app.toast("失败" + fail + "个");
          }else{
            app.toast("上传成功");
            _this.setData({
              imgList:[],
            });
          }
          setTimeout(function () {
            _this.setDefaultAlbum();
            _this.loadAlbum(_this, 0, 1, appConfig.pageSize);
          }, 2000);
      });
    }
  }
})