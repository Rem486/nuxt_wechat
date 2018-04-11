/**
 * Created by:tm  Date:2018/3/4
 */
/**
 * 测试方法
 */
/**
 * 路由测试上传素材
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
