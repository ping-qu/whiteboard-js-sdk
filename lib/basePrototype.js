'use strict'
/**
 * 基本请求类
 * @type {[type]}
 */
var ddvRestfulApi = require('ddv-restful-api')
var ddvRestfulWsApi = require('ddv-restful-ws-api')
var Whiteboard = require('./Whiteboard.js')

Object.assign(Whiteboard.prototype, {
  init: function init () {
    this.accessKeyId = null
    this.accessKey = null
    this.baseUrl = null
    this.headersPrefix = null

    this.apiInit()
    this.getAccessKey()
    .then(function () {
      return this.createWhiteboard()
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
        this.baseUrl = res.baseUrl || this.baseUrl || 'http://yun.linyue.hznwce.com/'
        this.headersPrefix = res.headersPrefix || this.headersPrefix || 'x-pq-'
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
  createWhiteboard: function createWhiteboard () {
    if (this.api) {
      return this.api.get('/v4_0/wsEventRpc/openWhiteboardDoc')
    } else {
      return Promise.reject(new Error('created a whiteboard failed'))
    }
  }
})
