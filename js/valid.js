var valid = {
  isValid : function(reg, str) {
    if (str == "" || !reg.test(str)) {
      return false;
    }
    return true;
  },
  isEmail : function (str) {
    var reg = /^([a-zA-Z0-9]+[_|\_|\.]?)*[a-zA-Z0-9]+@([a-zA-Z0-9]+[_|\_|\.]?)*[a-zA-Z0-9]+\.[a-zA-Z]{2,3}$/;
    return this.isValid(reg, str);
  },
  isChinese : function (str) {
    var reg = /^[\u0391-\uFFE5]+$/;
    return this.isValid(reg, str);
  },
  isEnglish : function (str) {
    var reg = /^[a-zA-Z]*$/;
    return this.isValid(reg, str);
  },
  isNumber : function (str) {
    var reg = /^[0-9]+$/;
    return this.isValid(reg, str);
  },
  isHttp: function (str) {
    var reg = /[a-zA-Z]+:\/\/[^\s]*/;
    return this.isValid(reg, str);
  },
  minlength : function(str, len){
    return str.length >= len
  }
}
module.exports = valid