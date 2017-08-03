'use strict'
/**
 * 画板指令基本扩展
 * @type {[type]}
 */
var Whiteboard = require('./Whiteboard.js')
Object.assign(Whiteboard.prototype, {
  // 切换文档事件
  tabFile: function tabFile (fileId) {
    if (digit(fileId)) {
      var cmds = 'tabFile|' + fileId
      return this.api.post('/v4_0/wsEventRpc/command')
        .send({
          'cmds': cmds
        })
    } else {
      return Promise.reject(new Error('fileId error'))
    }
  },
  // 切换页数
  tabPage: function tabPage (page) {
    if (digit(page)) {
      var cmds = 'tabPage|' + page
      return this.api.post('/v4_0/wsEventRpc/command')
        .send({
          'cmds': cmds
        })
    } else {
      return Promise.reject(new Error('page error'))
    }
  },
  // 画笔
  draw: function draw (size, color, coordinate, isBeak) {
    if (typeof isBeak === 'boolean' && isBeak) {
      this.breakpoint()
    }
    var cmds = '1'

    if (digit(size)) {
      cmds += ('-' + size)
    }

    if (isString(color)) {
      cmds += ('-' + color)
    }

    if (coordinate instanceof Array) {
      cmds += '|'
      for (var i = 0, len = coordinate.length; i < len; i++) {
        var xy = ''
        if (coordinate instanceof Array) {
          xy = coordinate[i][0] + ',' + coordinate[i][1] + '-'
        } else if (typeof coordinate[i] === 'object') {
          xy = coordinate[i].x + ',' + coordinate[i].y + '-'
        }
        cmds += xy
      }
    } else {
      return Promise.reject(new Error('Incorrect coordinate set'))
    }

    if (cmds) {
      return this.api.post('/v4_0/wsEventRpc/command')
        .send({
          'cmds': cmds
        })
    }
  },
  // 断点
  breakpoint: function breakpoint () {
    return this.api.post('/v4_0/wsEventRpc/command')
      .send({
        'cmds': '0'
      })
  },
  // 擦除
  erase: function erase (size, coordinate, isBeak) {
    if (typeof isBeak === 'boolean' && isBeak) {
      this.breakpoint()
    }
    var cmds = '2'

    if (digit(size)) {
      cmds += '-' + size
    }
    if (coordinate instanceof Array) {
      cmds += '|'
      for (var i = 0, len = coordinate.length; i < len; i++) {
        var xy = ''
        if (coordinate instanceof Array) {
          xy = coordinate[i][0] + ',' + coordinate[i][1] + '-'
        } else if (typeof coordinate[i] === 'object') {
          xy = coordinate[i].x + ',' + coordinate[i].y + '-'
        }
        cmds += xy
      }
    } else {
      return Promise.reject(new Error('Incorrect coordinate set'))
    }

    if (cmds) {
      return this.api.post('/v4_0/wsEventRpc/command')
        .send({
          'cmds': cmds
        })
    }
  },
  // 剪除
  cutoff: function cutoff (x, y, width, height) {
    var cmds = '3'

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

    cmds += ('-' + x + '-' + y + '-' + width + '-' + height)
    return this.api.post('/v4_0/wsEventRpc/command')
      .send({
        'cmds': cmds
      })
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
