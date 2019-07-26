//var host = "http://localhost/travelzs/public"
var host = "https://www.travelzs.com"

var config = {
  host,
  "api": {
    "auth": `${host}/api/admin/password/auth.json`,
    "login" : `${host}/api/admin/password/login.json`,
    "lists": `${host}/api/admin/password/lists.json`,
    "info" : `${host}/api/admin/password/info.json`,
    "requestSslKey": `${host}/api/admin/password/genKeys.json`,
    "savePublicKey": `${host}/api/admin/password/savePublicKey.json`,
    "savePwd" : `${host}/api/admin/password/add.json`,
    "remove" : `${host}/api/admin/password/del.json`,
    "resetPublicKey": `${host}/api/admin/password/reset.json`,
    "verifyKeys": `${host}/api/admin/password/verifyKeys.json`,
    "decrypt": `${host}/api/admin/password/decrypt.json`,
    "download" : `${host}/api/admin/password/download.json`,
    "sync" : `${host}/api/admin/password/sync.json`,
    "savePublicKeyClient": `${host}/api/admin/password/savePublicKeyClient.json`,
    "batchUpdate": `${host}/api/admin/password/batchUpdate.json`,
    "album": `${host}/api/virtual/album.json`,
    "albumUpload": `${host}/api/virtual/upload.json`,
    'albumRemove': `${host}/api/virtual/remove.json`,
  },
  "storeKeys": {
    "sslKeys": "sslKeys",
    "serverInfo" : "serverInfo",
    "sessionId": "sessionId",
    "background": "background",
    "password" : "password",
    "switchToLocal": "switchToLocal",
    "removedItem" : "removedItem",
    "newItem" : "newItem",
    "editItem" : "editItem",
  },
  "duration" : 1000,
  "switchToLocal": wx.getStorageSync("switchToLocal") || 0,
  "iconList": [{
    icon: 'edit',
    color: 'red',
    badge: 0,
    method : "add-password",
    name: '创建我的密码'
  }, {
    icon: 'keyboard',
    color: 'orange',
    badge: 1,
    method : "request-ssl-key",
    name: '创建公私钥'
    }, {
      icon: 'refresh',
      color: 'orange',
      badge: 0,
      method : "reset-ssl-key",
      name: '重置私钥'
    }],
  "noPublicKeyIcon": [{
    icon: 'edit',
    color: 'red',
    badge: 0,
    method: "add-password",
    name: '创建我的密码'
  }, {
      icon: 'refresh',
      color: 'orange',
      badge: 0,
      method: "reset-ssl-key",
      name: '重置私钥'
    },
    {
      icon: 'pulldown',
      color: 'orange',
      badge: 0,
      method: "save-to-local",
      name: '同步数据'
    },
    ],
    networkError:{
      code: 100010,
      msg: "网络链接失败，请重试"
    },
    pageSize: 50,
}

module.exports = config