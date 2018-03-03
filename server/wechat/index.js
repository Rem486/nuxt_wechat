/**
 * Created by:tm  Date:2018/3/1
 */
import mongoose from 'mongoose'
import config from '../config'
import Wechat from '../wechat-lib'

const Token = mongoose.model('Token')

// 生成wechat配置实例
const wechatConfig = {
  wechat: {
    appID: config.wechat.appID,
    appSecret: config.wechat.appSecret,
    token: config.wechat.token,
    getAccessToken: async () => await Token.getAccessToken(),
    saveAccessToken: async (data) => await Token.saveAccessToken(data)
  }
}

// 暴露wechat实例
export const getWechat = () => {
  const wechatClient = new Wechat(wechatConfig.wechat)

  return wechatClient
}

getWechat()
