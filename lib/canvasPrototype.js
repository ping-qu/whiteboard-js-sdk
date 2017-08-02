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

  var image = null
  var drawFlag = false
  var pst = {}

  // 判断是否是DOM对象
  function isDOM (obj) {
    return obj && typeof obj === 'object' && obj.nodeType === 1 && typeof obj.nodeName === 'string'
  }
  // 计算坐标
  function pos (event) {
    var x, y

    if (isTouch(event)) {
      x = event.touches[0].pageX
      y = event.touches[0].pageY
    } else {
      x = event.layerX
      y = event.layerY
    }
    return {
      'x': x,
      'y': y
    }
  }
  // 是否是触摸
  function isTouch (event) {
    return event.type.indexOf('touch') >= 0
  }

  function onMousedown (event) {
    event.preventDefault()
    this.ctx.beginPath()
    pst = pos(event)
    drawFlag = true
    this.drawStart()
  }

  function onMousemove (event) {
    if (!drawFlag) return
    event.preventDefault()
    pst = pos(event)
    this.drawwIng()
  }

  function onMouseup (event) {
    event.preventDefault()
    this.ctx.beginPath()
    drawFlag = false
  }

  function onMouseout () {
    this.ctx.beginPath()
  }

  var Canvas = function Canvas (container, params) {
    if (window && window.window && window.Image) {
      image = new window.Image()
    }

    var containerEl = isDOM(container) ? container : document.querySelector(container)
    Object.assign(defaultsOpts, params || {})

    if (containerEl && window.window && document) {
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
      // 鼠标点击
      this.canvasEl.addEventListener('mousedown', onMousedown.bind(this))
      // 鼠标移动
      this.canvasEl.addEventListener('mousemove', onMousemove.bind(this))
      // 鼠标弹起
      this.canvasEl.addEventListener('mouseup', onMouseup.bind(this))
      this.canvasEl.addEventListener('mouseout', onMouseout.bind(this))

      containerEl.append(this.canvasEl)
      containerEl = container = params = void 0
    }
  }

  Canvas.prototype = {
    // canvas绘图
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
    },
    // 修改配置参数
    setOpt: function setOpt (type, opt) {
      defaultsOpts[type] = opt

      if (type === 'mode') {
        this.ctx.beginPath()
      }
    },
    // 清除
    clearRect (x, y, width, height) {
      if (this.canvasEl && this.ctx) {
        x = x || 0
        y = y || 0
        width = width || this.canvasEl.width
        height = height || this.canvasEl.height
        this.ctx.clearRect(x, y, width, height)
      }
    },
    drawStart () {
      if (defaultsOpts.drawStart && typeof drawStart === 'function') {
        defaultsOpts.drawStart()
      }
    },
    // 绘画中
    drawwIng () {
      if (['draw', 'eraser'].indexOf(defaultsOpts.mode) < 0) return

      if (defaultsOpts.mode === 'draw') {
        this.ctx.globalCompositeOperation = 'source-over'
        this.ctx.lineTo(pst.x, pst.y)
        this.ctx.stroke()
      } else if (defaultsOpts.mode === 'eraser') {
        this.ctx.save()
        this.ctx.globalCompositeOperation = 'destination-out'
        this.ctx.lineTo(pst.x, pst.y)
        this.ctx.stroke()
        this.ctx.restore()
      }

      if (defaultsOpts.drawStart && typeof drawStart === 'function') {
        defaultsOpts.drawwIng(defaultsOpts.lineWidth, defaultsOpts.strokeStyle)
      }
    },
    drawEnd () {
      if (defaultsOpts.drawStart && typeof drawStart === 'function') {
        defaultsOpts.drawEnd()
      }
    }
  }

  Object.assign(Whiteboard.prototype, {
    Canvas: Canvas
  })
}())
