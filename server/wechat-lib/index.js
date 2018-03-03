/**
 * Created by:tm  Date:2018/3/1
 */
/**
 * 管理微信库
 */
import rp from 'request-promise'

const base = 'https://api.weixin.qq.com/cgi-bin/'
const api = {
  accessToken: `${base}token?grant_type=client_credential`,

}

export default class Wechat {
  constructor (opts) {
    this.opts = Object.assign({}, opts)

    // 获取外部参数
    this.appID = opts.appID
    this.appSecret = opts.appSecret
    this.getAccessToken = opts.getAccessToken
    this.saveAccessToken = opts.saveAccessToken

    this.fetchAccessToken()
  }

  /**
   * 统一管理微信的异步
   */
  async request (options) {
    options = Object.assign({}, options, { json: true })

    try {
      const response = await rp(options)
      console.log('微信获取到的token', response)
      return response
    } catch (e) {
      console.error(e)
    }
  }

  async fetchAccessToken () {
    // 使用外部方法获取token
    let data = await this.getAccessToken()

    // 不合法或失效
    if (!this.isValidAccessToken(data)) {
      data = await this.updateAccessToken()
    }

    await this.saveAccessToken(data)
    return data
  }

  /**
   * 更新token
   */
  async updateAccessToken () {
    const url = `${api.accessToken}&appid=${this.appID}&secret=${this.appSecret}`

    const data = await this.request({ url: url })
    const now = (new Date().getTime())

    data.expires_in = now + (data.expires_in - 20) * 1000
    console.log('更新token', data)
    return data
  }

  /**
   * 验证token
   */
  isValidAccessToken (data) {
    if (!data || !data.access_token || !data.expires_in) {
      return false
    }

    const expiresIn = data.expires_in
    const now = (new Date().getTime())

    // 判断时间是否失效
    return now < expiresIn
  }
}
