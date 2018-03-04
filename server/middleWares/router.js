/**
 * Created by:tm  Date:2018/2/28
 */
import Router from 'koa-router'
import config from '../config'
// 封装的微信中间件
import wechatMiddle from '../wechat-lib/middleWares'
// 微信业务逻辑，策略
import reply from '../wechat/reply'

export const router = app => {
  const router = new Router()

  /**
   * 微信服务器验证
   */
  router.all('/wechat-hear', wechatMiddle(config.wechat, reply))

  app
    .use(router.routes())
    .use(router.allowedMethods())
}
