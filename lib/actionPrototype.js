'use strict'
/**
 * 画板指令基本扩展
 * @type {[type]}
 */
var Whiteboard = require('./Whiteboard.js')
Object.assign(Whiteboard.prototype, {
  // 切换文档事件
  tabFile: function tabFile (fid) {
    if (digit(fid)) {
      var instruction = 'tabFile|' + fid
      console.log(instruction)
    }
  },
  // 切换页数
  tabPage: function tabPage (page) {
    if (digit(page)) {
      var instruction = 'tabPage|' + page
      console.log(instruction)
    }
  },
  // 画笔
  draw: function draw (size, color, coordinate, isBeak) {
    if (typeof isBeak === 'boolean' && isBeak) {
      this.breakpoint()
    }
    var instruction = ''

    if (digit(size)) {
      instruction += ('-' + size)
    }

    if (isString(color)) {
      instruction += ('-' + color)
    }

    if (Array.isArray(coordinate)) {
      instruction += '|'
      for (var i = 0, len = coordinate.length; i < len; i++) {
        var xy = ''
        if (Array.isArray(coordinate[i])) {
          xy = coordinate[i][0] + ',' + coordinate[i][1] + '-'
        } else if (typeof coordinate[i] === 'object') {
          xy = coordinate[i].x + ',' + coordinate[i].y + '-'
        }
        instruction += xy
      }
    }
    console.log(instruction)
  },
  // 断点
  breakpoint: function breakpoint () {

  },
  // 擦除
  erase: function erase (size, coordinate, isBeak) {
    if (typeof isBeak === 'boolean' && isBeak) {
      this.breakpoint()
    }
    var instruction = ''

    if (digit(size)) {
      instruction += '-' + size
    }
    if (Array.isArray(coordinate)) {
      instruction += '|'
      for (var i = 0, len = coordinate.length; i < len; i++) {
        var xy = ''
        if (Array.isArray(coordinate[i])) {
          xy = coordinate[i][0] + ',' + coordinate[i][1] + '-'
        } else if (typeof coordinate[i] === 'object') {
          xy = coordinate[i].x + ',' + coordinate[i].y + '-'
        }
        instruction += xy
      }
    }
    console.log(instruction)
  },
  // 剪除
  cutoff: function cutoff (x, y, width, height) {
    var instruction = ''

    if (!digit(x)) {
      x = '0'
    }
    if (!digit(y)) {
      y = '0'
    }
    if (!digit(width)) {
      width = '0'
    }
    if (!digit(height)) {
      height = '0'
    }

    instruction += ('-' + x + '-' + y + '-' + width + '-' + height)
    console.log(instruction)
  }
})

function digit (val) {
  return (isNumber(val) || isString(val)) && (Number(val) || Number(val) === 0) && val !== ''
}

function isNumber (val) {
  return typeof val === 'number'
}

function isString (val) {
  return typeof val === 'string'
}
