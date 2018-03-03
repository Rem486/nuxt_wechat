/**
 * Created by:tm  Date:2018/3/1
 */
/**
 * 管理票据
 * @type {*|Mongoose}
 */

const mongoose = require('mongoose')
const Schema = mongoose.Schema

// 获取全局票据 access_token
const TokenScheme = new Schema({
  name: String,
  token: String,
  expires_in: Number,
  meta: {
    // 创建时间
    createdAt: {
      type: Date,
      default: Date.now()
    },
    // 更新时间
    updatedAt: {
      type: Date,
      default: Date.now()
    }
  }
})

/**
 * mongoose 中间件
 */
// 拦截数据保存的处理，每次保存都执行
TokenScheme.pre('save', function (next) {
  // 绑定this
  console.log('保存数据的时候', this)
  if (this.isNew) {
    this.meta.createdAt = this.meta.updatedAt = Date.now()
  } else {
    this.meta.updatedAt = Date.now()
  }

  next()
})

// 静态方法
TokenScheme.statics = {
  async getAccessToken () {
    const token = await this.findOne({
      name: 'access_token'
    }).exec()

    console.log('数据库获取token', token)
    // 统一抛出的access_token
    if (token && token.token) {
      token.access_token = token.token
    }
    return token
  },

  async saveAccessToken (data) {
    let token = await this.findOne({
      name: 'access_token'
    }).exec()

    if (token) {
      token.token = data.access_token
      token.expires_in = data.expires_in
    } else {
      console.log('数据库新保存token', data)
      // 生成数据实例
      token = new Token({
        name: 'access_token',
        token: data.access_token,
        expires_in: data.expires_in
      })
    }

    // 保存数据
    await token.save()
    console.log('保存token结束')
    return data
  }
}

// 获取token的数据模型
const Token = mongoose.model('Token', TokenScheme)
