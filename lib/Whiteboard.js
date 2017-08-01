'use strict'
// 导出模块 -- 因为打包工具的特殊性，导出模块必须提前，否则异常
module.exports = Whiteboard
require('./basePrototype.js')
require('./actionPrototype.js')
require('./canvasPrototype.js')
// 方法
function Whiteboard (cb) {
  if (!(this instanceof Whiteboard)) {
    return new Whiteboard()
  }

  if (typeof cb === 'function') {
    this.setGetAccessKey(cb)
    this.init()
  }
}
Whiteboard.prototype = Whiteboard.prototype || Object.create(null)
// 默认导出支持 - 允许在 TypeScript 中使用默认导入语法
Whiteboard['default'] = Whiteboard
