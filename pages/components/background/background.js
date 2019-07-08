// pages/components/background.js
const util = require("../../../utils/util");
Component({
  /**
   * 组件的属性列表
   */
  properties: {
     background:{
       type: String,
       value: util.getBackground()
     }
  },

  /**
   * 组件的初始数据
   */
  data: {
  },

  /**
   * 组件的方法列表
   */
  methods: {
  }
})
