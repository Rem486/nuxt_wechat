/**
 * Created by:tm  Date:2018/3/3
 */
const tip = `我的卡丽熙，欢迎来到河间地\n点击<a href="http://www.baidu.com">一起搞事情吧</a>`

export default async (ctx, next) => {
  const message = ctx.weixin
  console.log('reply的ctx.weixin: ', message)

  // 引入封装好的微信方法 测试接口
  let wechat = require('../wechat')
  let client = wechat.getWechat()

  switch (message.MsgType) {
    // // 事件
    case 'event':
      if (message.Event === 'subscribe') {
        ctx.body = tip
      } else if (message.Event === 'unsubscribe') {
        console.log('掉粉了')
      } else if (message.Event === 'LOCATION') {
        ctx.body = message.Latitude + '-' + message.Longitude
      }
      break
    case 'text':
      if (message.Content === '1') {
        let userList = [
          { openid: 'o6YlSw3351cKB4n6oGtL7ngTPlgs', lang: 'zh_CN' },
          { openid: 'o6YlSw7_6YvCnUzLXtfeyugFQgrA', lang: 'zh_CN' },
          { openid: 'o6YlSw-VYCg-RMPdVpMwyf-QZ5zw', lang: 'zh_CN' },
          { openid: 'o6YlSw1QqktL045BHlgVofgaae3o', lang: 'zh_CN' },
          { openid: 'o6YlSw5jTbTRWw6HGYDq72v6QFPE', lang: 'zh_CN' },
          { openid: 'o6YlSw6cS-CLPMlPsrN37W8uqKCE', lang: 'zh_CN' }
        ]

        const data = await client.handleUpload('fetchTags')
        console.log('返回数据', data)
      }
      ctx.body = message.Content
      break
    case 'image':
      ctx.body = {
        type: 'image',
        mediaId: message.MediaId
      }
      break
    case 'voice':
      ctx.body = {
        type: 'voice',
        mediaId: message.MediaId
      }
      break
    case 'video':
      ctx.body = {
        type: 'video',
        mediaId: message.MediaId
      }
      break
    case 'location':
      ctx.body = message.Location_X + ' : ' + message.Location_Y + ' : ' + message.Label
      break
    case 'link':
      ctx.body = [{
        title: message.Title,
        description: message.Description,
        picUrl: 'http://i2.hdslb.com/bfs/archive/0d3a71fab6d1eddc7117525dbbcf5263a245c456.jpg',
        url: message.Url
      }]
      break
    default:
      ctx.body = tip
      break
  }
}
