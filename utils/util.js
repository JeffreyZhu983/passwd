const app =  getApp();
const appConfig = require("../config")
const Encrypt = require("../js/jsencrypt")
const sha1 = require("../js/sha1");

function http_build_query(formdata, numeric_prefix, arg_separator) {
  var value, key, tmp = [],
    that = this;
  var _http_build_query_helper = function (key, val, arg_separator) {
    var k, tmp = [];
    if (val === true) {
      val = '1';
    } else if (val === false) {
      val = '0';
    }
    if (val != null) {
      if (typeof val === 'object') {
        for (k in val) {
          if (val[k] != null) {
            tmp.push(_http_build_query_helper(key + '[' + k + ']', val[k], arg_separator));
          }
        }
        return tmp.join(arg_separator);
      } else if (typeof val !== 'function') {
        key = urldecode(key),
          val = urldecode(val); //有可能参数之前是encode过  add by fengwei
        return urlencode(key) + '=' + urlencode(val);
      } else {
        throw new Error('There was an error processing for http_build_query().');
      }
    } else {
      return '';
    }
  };

  if (!arg_separator) {
    arg_separator = '&';
  }
  for (key in formdata) {
    value = formdata[key];
    if (numeric_prefix && !isNaN(key)) {
      key = String(numeric_prefix) + key;
    }
    var query = _http_build_query_helper(key, value, arg_separator);
    if (query !== '') {
      tmp.push(query);
    }
  }
  return tmp.join(arg_separator);
}
//如php urlencode.
function urlencode(str) {
  str += '';
  return encodeURIComponent(str).replace(/!/g, '%21').replace(/'/g, '%27').replace(/\(/g, '%28').replace(/\)/g, '%29').replace(/\*/g, '%2A').replace(/%20/g, '+');
}
//php urldecode.
function urldecode(str) {
  try {
    return decodeURIComponent((str + '').replace(/%(?![\da-f]{2})/gi,
      function () {
        return '%25';
      }).replace(/\+/g, '%20'));
  } catch (e) {
    return '';
  }
}
var ksort = function(arr) {
  const ordered = {};
  Object.keys(arr).sort().forEach(function (key) {
    ordered[key] = arr[key];
  });
  return ordered;
}
const formatTime = date => {
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()
  const hour = date.getHours()
  const minute = date.getMinutes()
  const second = date.getSeconds()

  return [year, month, day].map(formatNumber).join('/') + ' ' + [hour, minute, second].map(formatNumber).join(':')
}

const formatNumber = n => {
  n = n.toString()
  return n[1] ? n : '0' + n
}

var showCreateTime = function(){
  var date = new Date();
  const month = date.getMonth() + 1
  const day = date.getDate()
  const hour = date.getHours()
  const minute = date.getMinutes()

  return [month, day].map(formatNumber).join('-') + ' ' + [hour, minute].map(formatNumber).join(':');
}
var wordwrap = function (str, width) {
  width = width || 64;
  if (!str) {
    return str;
  }
  var regex = "(.{1," + width + "})( +|$\n?)|(.{1," + width + "})";
  return str.match(RegExp(regex, "g")).join("\n");
};
var sslEncrypt = function(str, publicKey) {
  return this.encrypt(str, publicKey);
}
var sslDecrypt = function (str, privateKey) {
  //格式化js使用的private key格式，服务端返回的跟本地使用的不一致
  privateKey = privateKey.replace("-----BEGIN RSA PRIVATE KEY-----", "-----BEGIN PRIVATE KEY-----");
  privateKey = privateKey.replace("-----END RSA PRIVATE KEY-----", "-----END PRIVATE KEY-----");
  return this.decrypt(str, privateKey);
}
var hexSha1 = function(str){
  return sha1.sha1(str);
}
var sslSign = function (text, privateKey) {
  var crypt = new Encrypt.JSEncrypt({ default_key_size: 1024 });
  crypt.setPrivateKey(privateKey);
  return crypt.sign(text, hexSha1, '');
}
//验证公私钥
var verifySslKey = function(publicKey, privateKey){
  var verifyStr = "It's ok";
  var encrypt = this.encrypt(verifyStr, publicKey);
  var decrypt = this.decrypt(encrypt, privateKey);
  if (decrypt != verifyStr) {
    return false;
  }
  return true;
}

var genSslKey = function(){
  var crypt = new Encrypt.JSEncrypt({ default_key_size: 1024 });
  crypt.getKey();
  var publicKey = crypt.getPublicKey();
  var privateKey = crypt.getPrivateKey();
  return {
    publicKey : publicKey,
    privateKey : privateKey
  };
}
var encrypt = function (str, publicKey) {
  var crypt = new Encrypt.JSEncrypt();
  crypt.setPublicKey(publicKey);
  return crypt.encrypt(str);
}

var decrypt = function(str, privateKey){
  var crypt = new Encrypt.JSEncrypt();
  crypt.setPrivateKey(privateKey);

  var decStr = crypt.decrypt(str);
  if(decStr == null) return false;
  return decStr;
}

var getUrl = function(api, params) {
  if(typeof params == 'undefined')
  {
    params = {};
  }
  params.fromApp = "weixin";
  params.appId = wx.getAccountInfoSync().miniProgram.appId;
  if (!appConfig.api[api]) {
    return "";
  }
  params.isLocal = appConfig.api[api].indexOf("localhost") != -1 ? 1 : 0;
  if (appConfig.api[api].indexOf("?") !== -1) {
    return appConfig.api[api] + "&" + http_build_query(params);
  }
  return appConfig.api[api] + "?" + http_build_query(params);
}
var getSwitchToLocalStatus = function() {
  var localStatus = wx.getStorageSync(appConfig.storeKeys.switchToLocal) || 0;
  if(localStatus == 1) {
    return true;
  }
  return false;
}


var syncServerInfo = function() { //同步更新serverInfo和sslKey
  var sslKeys = wx.getStorageSync(appConfig.storeKeys.sslKeys)
  var serverInfo = wx.getStorageSync(appConfig.storeKeys.serverInfo);
  if (!serverInfo) return false;
  if (sslKeys && sslKeys['publicKey'] && sslKeys['privateKey'] &&
    serverInfo && serverInfo['sslKeys'] && (sslKeys['publicKey'] == serverInfo['sslKeys']['publicKey'])
  ) {
    serverInfo['sslKeys']['privateKey'] = sslKeys['privateKey'];
    wx.setStorageSync(appConfig.storeKeys.serverInfo, serverInfo);
  }
  return serverInfo;
}

var hasPublicKey = function() {
  var serverInfo = this.syncServerInfo();
  if (!serverInfo) {
    return false;
  }
  if (!serverInfo['sslKeys']) {
    return false;
  }
  if (!serverInfo['sslKeys']['publicKey'] || serverInfo['sslKeys']['publicKey'] == "") {
    return false;
  }
  return true;
}

var hasPrivateKey = function() {
  var serverInfo = this.syncServerInfo();
  if (!serverInfo) {
    return false;
  }
  if (!serverInfo['sslKeys']) {
    return false;
  }
  if (!serverInfo['sslKeys']['privateKey'] || serverInfo['sslKeys']['privateKey'] == "") {
    return false;
  }
  return true;
}

///
var getPublicKey = function() {
  var serverInfo = this.syncServerInfo();
  if (!serverInfo) {
    return "";
  }
  if (!serverInfo['sslKeys']) {
    return "";
  }
  if (!serverInfo['sslKeys']['publicKey'] || serverInfo['sslKeys']['publicKey'] == "") {
    return "";
  }
  return serverInfo['sslKeys']['publicKey'];
}
var getPrivateKey = function() {
  var serverInfo = this.syncServerInfo();
  if (!serverInfo) {
    return "";
  }
  if (!serverInfo['sslKeys']) {
    return "";
  }
  if (!serverInfo['sslKeys']['privateKey'] || serverInfo['sslKeys']['privateKey'] == "") {
    return "";
  }
  return serverInfo['sslKeys']['privateKey'];
}
var hasLogined = function() {
  var serverInfo = this.syncServerInfo();
  if (!serverInfo) {
    return false;
  }
  if (serverInfo.sessionId && serverInfo.openId &&
    serverInfo.sessionId != "" && serverInfo.openId != ""
  ) {
    return true;
  }
  return false;
}
var getSessionId = function() {
  var serverInfo = this.syncServerInfo();
  if (!serverInfo) {
    return "";
  }
  if (!serverInfo['sessionId']) {
    return "";
  }
  return serverInfo['sessionId'];
}
var getOpenId = function() {
  var serverInfo = this.syncServerInfo();
  if (!serverInfo) {
    return "";
  }
  if (!serverInfo['openId']) {
    return "";
  }
  return serverInfo['openId'];
}
var setBackground =  function(url) {
  wx.setStorageSync(appConfig.storeKeys.background, url);
}
var getBackground = function() {
  var background = wx.getStorageSync(appConfig.storeKeys.background);
  if (!background) return app.globalData.background;
  return background;
}
var promisify =  api => {
  return (options, ...params) => {
    return new Promise((resolve, reject) => {
      const extras = {
        success: resolve,
        fail: reject
      }
      api({ ...options, ...extras }, ...params)
    })
  }
}
module.exports = {
  formatTime: formatTime,
  hexSha1: hexSha1,
  sslEncrypt: encrypt,
  sslDecrypt: decrypt,
  sslSign: sslSign,
  encrypt: encrypt,
  decrypt: decrypt,
  genSslKey: genSslKey,
  verifySslKey: verifySslKey,
  getUrl: getUrl,
  httpBuild: http_build_query,
  getSwitchToLocalStatus: getSwitchToLocalStatus,
  showCreateTime: showCreateTime,
  syncServerInfo: syncServerInfo,
  hasPublicKey: hasPublicKey,
  hasPrivateKey: hasPrivateKey,
  getPublicKey: getPublicKey,
  getPrivateKey: getPrivateKey,
  hasLogined: hasLogined,
  getSessionId: getSessionId,
  getOpenId: getOpenId,
  setBackground: setBackground,
  getBackground: getBackground,
  promisify: promisify,
  ksort: ksort,
}
