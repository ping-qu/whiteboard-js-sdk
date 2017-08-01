'use strict'
/*
  * canvas画板
 */
var Whiteboard = require('./Whiteboard.js')

;(function () {
  var defaultsOpts = {
    imageUrl: '',
    // 长度
    width: 0,
    // 高度
    height: 0,
    // 笔宽
    lineWidth: 5,
    // 笔色
    strokeStyle: '#000',
    // 设置线交汇时，创建圆形边角
    lineJoin: 'round',
    // 设置线条两端为圆弧
    lineCap: 'round',
    // 方式, draw画，eraser擦除
    mode: 'draw'
  }

  var image = new window.Image()
  // 判断是否是DOM对象
  function isDOM (obj) {
    return obj && typeof obj === 'object' && obj.nodeType === 1 && typeof obj.nodeName === 'string'
  }

  var Canvas = function Canvas (container, params) {
    var containerEl = isDOM(container) ? container : document.querySelector(container)
    Object.assign(defaultsOpts, params || {})

    if (containerEl) {
      this.canvasEl = document.createElement('canvas')
      this.canvasEl.width = params.width || containerEl.offsetWidth
      this.canvasEl.height = params.height || containerEl.offsetHeight

      this.ctx = this.canvasEl.getContext('2d')
      // 设置画板参数
      this.ctx.lineWidth = params.lineWidth
      this.ctx.strokeStyle = params.strokeStyle
      this.ctx.lineJoin = params.lineJoin
      this.ctx.lineCap = params.lineCap
      // 有图片路径，绘入canvas
      params.imageUrl && this.drawImage(params.imageUrl)

      containerEl.append(this.canvasEl)
      containerEl = container = params = void 0
    }
  }

  Canvas.prototype = {
    drawImage: function drawImage (url, x, y, width, height) {
      if (url && this.canvasEl && this.ctx) {
        x = x || 0
        y = y || 0
        width = width || this.canvasEl.width
        height = height || this.canvasEl.height

        image.src = url
        image.onload(function () {
          if (image.complete) {
            this.ctx.drawImage(image, x, y, width, height)
          }
        })
      }
    }
  }

  Object.assign(Whiteboard.prototype, {
    Canvas: Canvas
  })
}())
