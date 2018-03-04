/**
 * Created by:tm  Date:2018/3/3
 */
import sha1 from 'sha1'
// 获取http请求里的数据包
import getRawBody from 'raw-body'
import * as util from './util'

/**
 * 微信消息处理中间件
 */

export default function (opts, reply) {
  // 返回异步的处理函数
  return async function wechatMiddle (ctx, next) {
    const token = opts.token
    const {
      signature,
      nonce,
      timestamp,
      echostr
    } = ctx.query

    // 签名用的字段进行排序组合
    const str = [token, timestamp, nonce].sort().join('')
    const sha = sha1(str)

    // get用于微信进行服务器验证
    console.log('签名验证', sha === signature)
    if (ctx.method === 'GET') {
      if (sha === signature) {
        // 返回验证信息
        ctx.body = echostr
      } else {
        ctx.body = 'Failed'
        return false
      }
      // 处理微信推送的消息
    } else if (ctx.method === 'POST') {
      // 签名验证不通过
      if (sha !== signature) {
        ctx.body = 'Failed'
        return false
      }
      // 拿到微信里的原始数据包
      const data = await getRawBody(ctx.req, {
        // 限制
        length: ctx.length,
        limit: '1mb',
        encoding: ctx.charset
      })

      //   xml解析出data
      const content = await util.parseXML(data)
      console.log('解析出的content', content)
      // 获取xml里的信息 挂载在上下文上
      ctx.weixin = util.formatMessage(content.xml)

      // 传入上下文
      await reply.apply(ctx, [ctx, next])

      // 构建传递给微信的xml
      // 回复的内容
      const replyBody = ctx.body
      const msg = ctx.weixin
      const xml = util.tpl(replyBody, msg)
      // console.log('content.xml：', content.xml)
      console.log('消息回复的body', replyBody)
      console.log('回复的xml', xml)
      ctx.status = 200
      ctx.type = 'application/xml'
      ctx.body = xml
    }
  }
}
