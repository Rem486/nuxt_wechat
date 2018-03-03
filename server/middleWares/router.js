/**
 * Created by:tm  Date:2018/2/28
 */
import Router from 'koa-router'
import sha1 from 'sha1'
import config from '../config'

export const router = app => {
  const router = new Router()

  router.get('/wechat-hear', (ctx, next) => {
    // 访问这个的时候才引入创建的wechat实例
    require('../wechat')

    const token = config.wechat.token
    const {
      signature,
      nonce,
      timestamp,
      echostr
    } = ctx.query

    // 签名用的字段进行排序组合
    const str = [token, timestamp, nonce].sort().join('')
    const sha = sha1(str)

    console.log('签名是否一致', sha === signature)
    // 验证签名是否正确
    if (sha === signature) {
      // 返回验证信息
      ctx.body = echostr
    } else {
      ctx.body = 'Failed'
    }
  })

  app.use(router.routes())
  app.use(router.allowedMethods())
}
