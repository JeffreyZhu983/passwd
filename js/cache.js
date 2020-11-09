const app = getApp();
const appConfig = require("../config");
const valid = require("../js/valid");
const utils = require("../utils/util");

var checkExist = function(val, data, filed) {
  filed = filed || "id";
  for (var i in data) {
    if (val == data[i][filed]) {
      return i;
    }
  }
  return false;
}
var isSame = function(val, val2) {
  if (val.length != val2.length) return false;
  for (var i in val) {
    if (val[i] != val2[i]) {
      return false;
    }
  }
  return true;
}
var addItem = function(item) {
  //检查是否存在
  var data = wx.getStorageSync(appConfig.storeKeys.password) || [];
  var isExists = checkExist(item['name'], data, 'name');
  if (isExists) {
    app.warning("已经存在相关记录~");
    return;
  }
  data.unshift(item);
  wx.setStorageSync(appConfig.storeKeys.password, data);
  //保存到新增item中
  var newItem = wx.getStorageSync(appConfig.storeKeys.newItem) || [];
  newItem.unshift(item);
  wx.setStorageSync(appConfig.storeKeys.newItem, data);
}
var removeItemByName = function(id, name) {
  //检查是否存在
  var data = wx.getStorageSync(appConfig.storeKeys.password) || [];
  var isExists = checkExist(name, data, 'name');

  if (!isExists) {
    app.warning("未找到相关记录");
    return;
  }
  data.splice(isExists, 1);
  wx.setStorageSync(appConfig.storeKeys.password, data);
  if (id) {
    //将删除的内容放到临时存储
    var removedItem = wx.getStorageSync(appConfig.storeKeys.removedItem) || [];
    removedItem.unshift(id);
    wx.setStorageSync(appConfig.storeKeys.removedItem, removedItem);
  }
}
var editLocal = function(item) {
  var newItem = wx.getStorageSync(appConfig.storeKeys.newItem) || [];
  var isFind = false;
  for (var i in newItem) {
    if (newItem[i]['name'] == item.name) {
      newItem[i] = item;
      isFind = true;
    }
  }
  if (!isFind) {
    newItem.unshift(item);
  }
  wx.setStorageSync(appConfig.storeKeys.newItem, newItem);
}
var editSingle = function(item) {
  //检查是否存在
  var data = wx.getStorageSync(appConfig.storeKeys.password) || [];
  var isExists = checkExist(item['id'], data);
  if (isExists) {
    data[isExists] = item;
  } else {
    data.unshift(item);
  }
  wx.setStorageSync(appConfig.storeKeys.password, data);
  //如果是本地编辑就将他放到
  if (!item.id || !item.id == '') {
    editLocal(item);
  }
}

var info = function(id) {
  var data = wx.getStorageSync(appConfig.storeKeys.password) || [];
  for (var i in data) {
    if (data[i]['id'] == id) {
      return data[i];
    }
  }
  return false;
}

var sync = function(data) {
  if (!data) {
    wx.showToast({
      title: '参数不正确，请检查后重试！～',
      duration: appConfig.duration
    });
    return;
  }
  if (!valid.minlength(data.name, 2)) {
    app.warning("名称不能少于2个字符");
    return;
  }
  if (!valid.minlength(data.account, 2)) {
    app.warning("账户名称不能少于3个字符");
    return;
  }
  if (!valid.minlength(data.password, 6)) {
    app.warning("密码不能少于6个字符");
    return;
  }
  if (!valid.isHttp(data.link)) {
    app.warning("链接地址不正确");
    return;
  }
  var header = {
    'content-type': 'application/x-www-form-urlencoded',
    'cookie': wx.getStorageSync(appConfig.storeKeys.sessionId)
  };
  wx.request({
    url: utils.getUrl("sync"),
    data: data,
    header: header,
    method: "POST",
    dataType: "json",
    success: function(res) {
      if (typeof res.data == 'string') {
        app.warning("同步数据失败～");
        return;
      }
      app.syncSuccess(res.data);
    },
    fail: function(res) {
      wx.showToast({
        title: '保存失败，请重试',
        duration: appConfig.duration
      });
      app.syncSuccess(appConfig.networkError);
    }
  });
}

var download = function(page, pageSize) {
  wx.showLoading({
    title: '正在同步',
  });
  var _this = this;
  var header = {
    'content-type': 'application/x-www-form-urlencoded',
    'cookie': wx.getStorageSync(appConfig.storeKeys.sessionId)
  };
  //先检查本地是否有删除的数据
  var removedItem = wx.getStorageSync(appConfig.storeKeys.removedItem) || [];
  if (removedItem.length > 0) {
    //批量删除
    var id = removedItem.join(",");
    wx.request({
      url: utils.getUrl("remove"),
      header: header,
      data: {
        ids: id
      },
      method: "POST",
      dataType: "json",
      success: function(req) {
        wx.removeStorageSync(appConfig.storeKeys.removedItem);
        download(page, pageSize);
      },
      fail: function(req) {
        wx.hideLoading();
        app.warning(appConfig.networkError.msg);
      }
    });
    return;
  }
  //再检查本地是否有新增的数据
  var newItem = wx.getStorageSync(appConfig.storeKeys.newItem) || [];
  if (newItem.length > 0) {
    wx.request({
      url: utils.getUrl('batchUpdate'),
      header: header,
      data: {
        data: JSON.stringify(newItem)
      },
      dataType: 'json',
      method: 'post',
      success: function(res) {
        if (res.data) {
          if (res.data.data) {
            for (var i in res.data.data) {
              var code = res.data.data[i]['code'];
              var operate = res.data.data[i]['operate'] || "";
              var data = res.data.data[i]['data'];
              if (code == 0) {
                //更新本地数据,并删除已经保存过的数据
                if (operate == 'edit') {
                  editSingle(data);
                } else if (operate == 'add') {
                  removeItemByName("", data.name);
                }
              }
            }
            wx.removeStorageSync(appConfig.storeKeys.newItem);
            download(page, pageSize);
          }
        }
      },
      fail: function(res) {
        wx.hideLoading();
        app.warning(appConfig.networkError.msg);
        if (app.syncRes) {
          app.syncRes(appConfig.networkError);
        }
      }
    })
    return;
  };
  wx.request({
    url: utils.getUrl("download", {
      page: page,
      pageSize: pageSize
    }),
    header: header,
    dataType: 'json',
    success: function(res) {
      wx.hideLoading();
      app.storeToLocal(res);
      if (typeof res.data == 'string') {
        app.warning("拉取数据失败～");
        return;
      }

      var data = wx.getStorageSync(appConfig.storeKeys.password) || [];
      if (data.length == 0) {
        try {
          wx.setStorageSync(appConfig.storeKeys.password, res.data.lists);
        } catch (e) {}
        if (app.syncRes) {
          app.syncRes({
            code: 0,
            msg: "同步成功"
          });
        }
        return;
      }
      var showFinish = true;
      for (var i in res.data.lists) {
        var isExist = checkExist(res.data.lists[i]['id'], data);
        var _currentVal = res.data.lists[i];
        if (isExist !== false) {
          //如果存在的话, 数据不一致就提示用户是否更新
          if (!isSame(data[isExist], res.data.lists[i])) {
            showFinish = false;
            wx.showModal({
              title: '温馨提示',
              content: '您本地保存账户' + data[isExist]['account'] + '信息与服务器上保存的不一致',
              cancelText: "覆盖线上",
              confirmText: "覆盖本地",
              success: function(item) {
                if (item.confirm) {
                  //覆盖本地
                  data[isExist] = _currentVal;
                  try {
                    wx.setStorageSync(appConfig.storeKeys.password, data);
                    if (appConfig.switchToLocal) {
                      _this.getFromLocal(1, appConfig.pageSize);
                    }
                  } catch (e) {}
                  download(page, pageSize);
                } else {
                  //同步线上
                  sync(data[isExist]);
                }
              }
            });
            return;
          }
        } else {
          data.unshift(res.data.lists[i]);
        }
      }
      try {
        wx.setStorageSync(appConfig.storeKeys.password, data);
        if (showFinish) {
          if (appConfig.switchToLocal) {
            _this.getFromLocal(1, appConfig.pageSize);
          }
          if (app.syncRes) {
            app.syncRes({
              code: 0,
              msg: "同步成功"
            });
          }
        }
      } catch (e) {}
    },
    fail: function(res) {
      wx.hideLoading();
      app.warning(appConfig.networkError.msg);
      if (app.syncRes) {
        app.syncRes(appConfig.networkError);
      }
    }
  });
}
var getFromLocal = function(page, pageSize, keyword) {
  var pages = {
    total: 0,
    currentPage: 1,
    totalPage: 0,
    pageSize: parseInt(pageSize)
  };
  var start = (parseInt(page) - 1) * pageSize;
  var end = pageSize;

  var data = wx.getStorageSync(appConfig.storeKeys.password) || [];
  //排序
  data.sort(function(x, y) {
    return parseInt(y['id']) - parseInt(x['id']);
  });
  //如果传了搜索关键字，就过滤一下数据再输出
  if(keyword != "") {
    var tmpArr = new Array();
    for(var i in data) {
      var val = data[i];
      if(val['name'].indexOf(keyword) != -1 ||
        val['account'].indexOf(keyword) != -1||
        val['note'].indexOf(keyword) != -1
      ) {
        tmpArr.push(data[i])
      }
    }
    data = tmpArr;
  }
  pages.total = parseInt(data.length);
  pages.totalPage = Math.ceil(pages.total / pages.pageSize);
  pages.currentPage = Math.min(parseInt(page), pages.totalPage);
  var lists = data.slice(start, end);

  var res = {
    pages: pages,
    lists: lists
  };
  return res;
}
module.exports = {
  info: info,
  editSingle: editSingle,
  download: download,
  sync: download,
  getFromLocal: getFromLocal,
  addItem: addItem,
  removeItemByName: removeItemByName,
}