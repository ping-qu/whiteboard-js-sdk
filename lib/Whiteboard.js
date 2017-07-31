'use strict'
// 导出模块 -- 因为打包工具的特殊性，导出模块必须提前，否则异常
module.exports = Whiteboard
require('./basePrototype.js')
require('./actionPrototype.js')
// 方法
function Whiteboard () {
  if (!(this instanceof Whiteboard)) {
    return new Whiteboard()
  } else {
    this.init()
  }
}
Whiteboard.prototype = Whiteboard.prototype || Object.create(null)
// 默认导出支持 - 允许在 TypeScript 中使用默认导入语法
Whiteboard['default'] = Whiteboard
