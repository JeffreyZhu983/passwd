const app = getApp()
const appConfig = require('config')
const login = require('js/login')
const lists = require('js/lists')
const genKeys = require('js/genKeys')
const saveKeys = require('js/saveKeys')
const savePwd = require("js/savePwd")
const resetKeys = require("js/resetKeys")
const info = require("js/info")
const decrypt = require("js/decrypt")
const verifyKeys = require("js/verifyKeys")
const remove = require("js/remove")
const saveClientPublicKey = require('js/saveClientPublicKey')
const album = require("js/album")

var common = {
  login: function(_this) {
    login(_this)
  },
  lists: function(_this, page, pageSize) {
    lists.pwd(_this, page, pageSize)
  },
  genKeys: function(_this) {
    genKeys(_this);
  },
  saveKeys: function(_this) {
    saveKeys(_this)
  },
  savePwd: function(_this, data) {
    savePwd(_this, data);
  },
  resetKeys: function(_this, data) {
    resetKeys(_this, data)
  },
  info: function(id) {
    info(id);
  },
  decrypt: function(str, key) {
    decrypt(str, key);
  },
  verifyKeys: function(publicKey, privateKey) {
    verifyKeys(publicKey, privateKey);
  },
  remove: function(id, name) {
    remove(id, name);
  },
  saveClientPublicKey: function(_this, publicKey, privateKey){
    saveClientPublicKey(_this, publicKey, privateKey);
  },
  album: function (_this, lastId, page, pageSize) {
    album.lists(_this, lastId, page, pageSize);
  },
  albumRemove: function (_this, uid, id, type) {
    album.remove(_this, uid, id, type);
  }
}

module.exports = common