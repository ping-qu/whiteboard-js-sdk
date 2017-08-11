'use strict'
/**
 * 基本请求类
 * @type {[type]}
 */
var ddvRestfulApi = require('ddv-restful-api')
var ddvRestfulWsApi = require('ddv-restful-ws-api')
var uploadapi = require('ddv-upload-api')
var Whiteboard = require('./Whiteboard.js')

;(function () {
  var cmdProcess = []
  var params = null
  var acts = null

  function cmds (str) {
    var instruc = str.split('\n')
    for (var i = 0, len = instruc.length; i < len; i++) {
      cmd(instruc[i])
    }
  }

  function cmd (str) {
    if (!((str) && typeof str === 'string')) {
      throw new Error('不存在该命令')
    }

    var dataIndex = str.indexOf('|')
    var cmdArgs, data

    if (dataIndex > 0) {
      cmdArgs = str.substr(0, dataIndex)
      data = str.substr(dataIndex + 1)
    } else {
      cmdArgs = str
      data = ''
    }
    cmdArgs = cmdArgs.split('-')
    var action = cmdArgs.splice(0, 1)[0]
    cmdArgs.unshift(data)
    cmdProcess.push([action, cmdArgs])
    checkCmdRun()
  }

  function checkCmdRun () {
    var t = cmdProcess.splice(0, 1)[0] || null
    if (t) {
      action(t[0], t[1])
    }
  }

  function action (act, args) {
    acts = act
    params = {}

    if (args.length) {
      if (act === '1' || act === '2') {
        params.xys = getXy(args[0])
        params.size = args[1]

        if (args[2]) {
          params.color = args[2]
        }
      } else if (act === 'tabFile') {
        params.fileId = args[0]
      } else if (act === 'tabPage') {
        params.pageNow = args[0]
      } else if (act === '3') {
        params.x = args[1]
        params.y = args[2]
        params.width = args[3]
        params.height = args[4]
      }
    }
  }

  function getXy (t) {
    t = t || ''
    return JSON.parse('[[' + t.split('-').join('],[') + ']]')
  }

  Object.assign(Whiteboard.prototype, {
    init: function init () {
      this.accessKeyId = null
      this.accessKey = null
      this.baseUrl = null
      this.headersPrefix = null
      this.webSocketUrl = null
      this.gwcid = null

      this.apiInit()
      return this.getAccessKey()
        .then(function () {
          uploadapi.setApi(this.api)
        }.bind(this))
        .catch(function (e) {
          console.log(e)
        })
    },
    setGetAccessKey: function setGetAccessKey (fn) {
      this._getAccessKey = fn
    },
    getAccessKey: function getAccessKey () {
      if (typeof this._getAccessKey === 'function') {
        var cb
        return new Promise(function (resolve, reject) {
          cb = function cbFn (e, res) {
            cb = void 0
            e ? reject(e) : resolve(res)
          }
          var promise = this._getAccessKey(cb)
          if (promise && promise.then) {
            promise.then(function cb (res) {
              cb && cb(null, res)
            }, function onError (e) {
              cb && cb(e)
            })
          }
          promise = void 0
        }.bind(this))
          .then(function saveCb (res) {
            this.accessKeyId = res.accessKeyId
            this.accessKey = res.accessKey
            this.baseUrl = res.baseUrl || this.baseUrl || 'http://api.cloud.ping-qu.com/'
            this.headersPrefix = res.headersPrefix || this.headersPrefix || 'x-pq-'
            this.webSocketUrl = res.webSocketUrl || this.webSocketUrl || 'ws://push.cloud.ping-qu.com/v1_0/conn'
            this.api.setBaseUrl(this.baseUrl)
            this.api.setHeadersPrefix(this.headersPrefix)
            this.api.setWebSocketUrl(this.webSocketUrl)
          }.bind(this))
      } else {
        return Promise.reject(new Error('Must has setGetAccessKey'))
      }
    },
    onAccessKey: function onAccessKey (auth, requests, response, tryNum) {
      return Promise.resolve({
        accessKeyId: this.accessKeyId,
        accessKey: this.accessKey
      })
        .then(function checkAccessKey (res) {
          if (res.accessKeyId && res.accessKey && tryNum < 1) {
            return res
          } else {
            return this.getAccessKey()
          }
        }.bind(this))
        .then(function () {
          // 当请求次数tryNum>0,请求获取setAccessKeyId、setAccessKey
          // 时差
          var differenceTime = 0
          var d = new Date()
          auth.setSignTimeString(new Date(parseInt(d.getTime() + ((parseInt(differenceTime) || 0) * 1000)) + (60 * d.getTimezoneOffset())))
          d = void 0
          auth.setAuthVersion('pingqu-whiteboard-auth-v1')
            .setAccessKeyId(this.accessKeyId)
            .setAccessKey(this.accessKey)
          return Promise.resolve(auth)
        }.bind(this))
    },
    apiInit: function apiInit () {
      this.api = ddvRestfulApi.getApi(function setConfig (api) {
        // 授权升级
        api.setOnAccessKey(this.onAccessKey.bind(this))
        ddvRestfulWsApi(api)
      }.bind(this))
    },
    // 打开白板
    openWhiteboard: function openWhiteboard (obj) {
      obj = typeof obj === 'object' ? obj : {}
      return this.api.get('/v4_0/api/whiteboard/openWhiteboard')
      .send(obj)
    },
    // 获取文件列表
    getFileLists: function getFileLists () {
      return this.api.get('/v4_0/api/whiteboard/file')
    },
    // 删除文件
    delFile: function delFile (fileId) {
      return this.api.del('/v4_0/api/whiteboard/file/' + fileId)
    },
    // 使用文件
    useFile: function useFile (fileId) {
      return this.api.get('/v4_0/api/whiteboard/file/' + fileId)
    },
    // 创建白板
    createWhiteboard: function createWhiteboard () {
      return this.api.get('/v4_0/whiteboard/create')
    },
    // 上传文件
    uploadFile: function uploadFile (params, event) {
      var file = params.file || event.target.files[0]
      params.onSuccess = typeof params.onSuccess === 'function' ? params.onSuccess : function () {}
      params.onError = typeof params.onError === 'function' ? params.onError : function () {}
      params.onProgress = typeof params.onProgress === 'function' ? params.onProgress : function () {}
      params.onAddFileError = typeof params.onAddFileError === 'function' ? params.onAddFileError : function () {}

      uploadapi({
        manageType: 'file',
        authType: 'userPpt',
        getPartSizeMethod: 'GET',
        getFileIdMethod: 'GET',
        getFilePartInfoMethod: 'GET',
        getFilePartSignMethod: 'GET',
        getFilePartInfoUrl: '/v4_0/upload/filePartInfo',
        getFilePartSignUrl: '/v4_0/upload/filePartMd5',
        completeUploadUrl: '/v4_0/upload/complete',
        getPartSizeUrl: '/v4_0/upload/filePartSize',
        getFileIdUrl: '/v4_0/upload/fileId',
        file: file,
        onSuccess: function onSuccess (fileData) {
          this.addFile(fileData.url, fileData.fileName)
            .then(function (res) {
              params.onSuccess(fileData, res)
            })
            .catch(function (e) {
              params.onAddFileError(e)
            })
        }.bind(this),
        onError: params.onError,
        onProgress: params.onProgress
      })
    },
    // 添加文件
    addFile: function addFile (url, title) {
      return this.api.post('/v4_0/api/whiteboard/file')
        .send({
          url: url,
          title: title
        })
    },
    // ws
    wsOpen: function wsOpen (whiteboardId, cbObj) {
      if (!whiteboardId) {
        throw new Error('whiteboard_id is not found')
      } else {
        // 获取白板图片的长链地址
        var getImageUrl = '/whiteboard/' + whiteboardId + '/image'
        cbObj.getWhiteboardIamge = typeof cbObj.getWhiteboardIamge === 'function' ? cbObj.getWhiteboardIamge : function () {}
        cbObj.getWhiteboardCommand = typeof cbObj.getWhiteboardCommand === 'function' ? cbObj.getWhiteboardCommand : function () {}

        this.api.pushOpen()
          .then(function (res) {
            this.gwcid = res.headers.gwcid

            this.api.on(['push', 'message', getImageUrl], cbObj.getWhiteboardIamge)
            this.api.on(['push', 'message', '/whiteboard/command'], function (headers, body, res) {
              var obj
              try {
                obj = JSON.parse(res.body)
              } catch (e) {
                obj = res.body
              }
              for (var i = 0, len = obj.lists.length; i < len; i++) {
                if (obj.lists[i].content.gwcid !== this.gwcid) {
                  cmds(obj.lists[i].content.cmds)
                  cbObj.getWhiteboardCommand(acts, params)
                }
              }
            }.bind(this))
          }.bind(this))
      }
    }
  })
}())
