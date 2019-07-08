var rand = {
  alpha : "0123456789",
  smallLetter : "abcdefghijklmnopqrstuvwxyz",
  bigLetter : "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
  specialChars : ",.;:~!@#$%^&*-_",
  shuffle : function (arr) {
      var len = arr.length;
      var randindex, tmp;
      for (var i = len; i > 0; i--) {
        randindex = Math.floor(Math.random() * i);//随机数的产生范围每次都变化
        tmp = arr[randindex];
        arr[randindex] = arr[i - 1];
        arr[i - 1] = tmp;
      }
      return arr;
  },
  genRandStr : function (chars, length, unique) {
    var str = [];
    for (var i = 0; i < length; i++) {
      if (chars.length == 0) break;
      var index = this.rand(chars.length);
      str.push(chars[index])
      if (unique) {
        chars.splice(index, 1)
      }
    }
    return str;
  },
  getRndUniue : function (chars, length) {
    var _chars = this.shuffle(chars);
    return _chars.splice(0, length);
  },
  rand : function (max) {
    return Math.floor(Math.random() * max);
  },
  genRandStr : function (chars, length, unique) {
    var str = [];
    for (var i = 0; i < length; i++) {
      if (chars.length == 0) break;
      var index = this.rand(chars.length);
      str.push(chars[index])
      if (unique) {
        chars.splice(index, 1)
      }
    }
    return str;
  },
  randAlpha : function (length, unique) {
    var chars = this.alpha.split("");

    return this.genRandStr(chars, length, unique);
  },
  randSmallLetter : function (length, unique) {
    var chars = this.smallLetter.split("");

    return this.genRandStr(chars, length, unique);
  },
  randBigLetter : function (length, unique) {
    var chars = this.bigLetter.split("");

    return this.genRandStr(chars, length, unique)
  },
  randCombin: function (combin, length, unique){
    var chars = "";
    var combin = combin.split(",");
    for (var i in combin) {
      var str = combin[i];
      switch (str) {
        case "alpha":
          chars += this.alpha;
          break;
        case "smallLetter":
          chars += this.smallLetter;
          break;
        case "bigLetter":
          chars += this.bigLetter;
          break;
        case "specialChars":
          chars += this.specialChars;
          break;
        default:
          break;
      }
    }
    //如果长度不够，就用当前串随机出不够长度的内容补齐
    if (chars.length < length) {
      var rndStr = this.shuffle(chars.split("")).join("");
      chars += rndStr.substr(0, length - chars.length)
    }
    if (unique) return this.getRndUniue(chars.split(""), length).join("");
    return this.genRandStr(chars, length, unique).join("");
  },

}
module.exports = rand