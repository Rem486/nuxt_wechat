/**
 * Created by:tm  Date:2018/2/28
 */
import Router from 'koa-router'
import { resolve } from 'path'
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

  /**
   * 上传
   */
  router.get('/upload', async (ctx, next) => {
    // 引入封装好的微信方法
    const wechat = require('../wechat')
    let client = wechat.getWechat()

    const news = {
      articles: [
        {
          title: 'ssr',
          thumb_media_id: 'tvL4aN_TYkpLeFIh6wcqqS4braZKYjlVCqOyHuDVlu8',
          author: 'ssss',
          digest: '没有描述',
          show_cover_pic: 1,
          content: 'meiyouneirong',
          content_source_url: 'http://www.baidu.com'
        },
        {
          title: 'ssr',
          thumb_media_id: 'tvL4aN_TYkpLeFIh6wcqqS4braZKYjlVCqOyHuDVlu8',
          author: 'ssss',
          digest: '没有描述',
          show_cover_pic: 1,
          content: 'meiyouneirong',
          content_source_url: 'http://www.baidu.com'
        }
      ]
    }
    await client.handleUpload('uploadMaterial', 'news', news, {}
      // resolve(__dirname, '../../logo.png')
      // ,{
      //   type: 'image'
      // type: 'video',
      // description: '{"title": "haha", "introduction": "这是个介绍"}'
      // }
    )
  })

  app
    .use(router.routes())
    .use(router.allowedMethods())
}
