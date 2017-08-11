'use strict'
/**
 * 画板指令基本扩展
 * @type {[type]}
 */
var Whiteboard = require('./Whiteboard.js')

;(function () {
  function digit (val) {
    return (isNumber(val) || isString(val)) && (Number(val) || Number(val) === 0) && val !== ''
  }

  function isNumber (val) {
    return typeof val === 'number'
  }

  function isString (val) {
    return typeof val === 'string'
  }

  Object.assign(Whiteboard.prototype, {
    // 切换文档事件
    tabFile: function tabFile (fileId) {
      if (digit(fileId)) {
        var cmds = 'tabFile|' + fileId
        var ajaxData = {
          'cmds': cmds
        }

        if (this.gwcid) {
          ajaxData.gwcid = this.gwcid
        }
        return this.api.post('/v4_0/api/whiteboard/command')
          .send(ajaxData)
      } else {
        return Promise.reject(new Error('fileId error'))
      }
    },
    // 切换页数
    tabPage: function tabPage (page) {
      if (digit(page)) {
        var cmds = 'tabPage|' + page
        var ajaxData = {
          'cmds': cmds
        }

        if (this.gwcid) {
          ajaxData.gwcid = this.gwcid
        }
        return this.api.post('/v4_0/api/whiteboard/command')
          .send(ajaxData)
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
            xy = i !== 0 ? '-' : ''
            xy += coordinate[i][0] + ',' + coordinate[i][1]
          } else if (typeof coordinate[i] === 'object') {
            xy = i !== 0 ? '-' : ''
            xy += coordinate[i].x + ',' + coordinate[i].y + '-'
          }
          cmds += xy
        }
      } else {
        return Promise.reject(new Error('Incorrect coordinate set'))
      }

      var ajaxData = {
        'cmds': cmds
      }

      if (this.gwcid) {
        ajaxData.gwcid = this.gwcid
      }

      if (cmds) {
        return this.api.post('/v4_0/api/whiteboard/command')
          .send(ajaxData)
      }
    },
    // 断点
    breakpoint: function breakpoint () {
      var ajaxData = {
        'cmds': '0'
      }

      if (this.gwcid) {
        ajaxData.gwcid = this.gwcid
      }
      return this.api.post('/v4_0/api/whiteboard/command')
        .send(ajaxData)
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
            xy = i !== 0 ? '-' : ''
            xy += coordinate[i][0] + ',' + coordinate[i][1]
          } else if (typeof coordinate[i] === 'object') {
            xy = i !== 0 ? '-' : ''
            xy += coordinate[i].x + ',' + coordinate[i].y
          }
          cmds += xy
        }
      } else {
        return Promise.reject(new Error('Incorrect coordinate set'))
      }

      if (cmds) {
        var ajaxData = {
          'cmds': cmds
        }

        if (this.gwcid) {
          ajaxData.gwcid = this.gwcid
        }
        return this.api.post('/v4_0/api/whiteboard/command')
          .send(ajaxData)
      }
    },
    // 剪除
    cutoff: function cutoff (x, y, width, height) {
      var cmds = '3'

      if (!digit(x)) {
        x = ''
      }
      if (!digit(y)) {
        y = ''
      }
      if (!digit(width)) {
        width = ''
      }
      if (!digit(height)) {
        height = ''
      }

      cmds += ('-' + x + '-' + y + '-' + width + '-' + height)

      var ajaxData = {
        'cmds': cmds
      }

      if (this.gwcid) {
        ajaxData.gwcid = this.gwcid
      }
      return this.api.post('/v4_0/api/whiteboard/command')
        .send(ajaxData)
    }
  })
}())
