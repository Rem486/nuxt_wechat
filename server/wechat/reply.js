/**
 * Created by:tm  Date:2018/3/3
 */
const tip = `我的卡丽熙，欢迎来到河间地\n点击<a href="http://www.baidu.com">一起搞事情吧</a>`

export default async (ctx, next) => {
  const message = ctx.weixin
  console.log('reply的ctx.weixin: ', message)

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
