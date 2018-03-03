import Koa from 'koa'
import { Nuxt, Builder } from 'nuxt'
import R from 'ramda'
import { resolve } from 'path'

// 处理文件路径
const r = path => resolve(__dirname, path)
// 定义中间件
const MIDDLEWARES = ['database', 'router']

// 构建服务器
class Server {
  constructor () {
    this.app = new Koa()
    this.useMiddleWare(this.app)(MIDDLEWARES)
  }

  useMiddleWare (app) {
    return R.map(R.compose(
      // 对引入的每个中间件传入app
      R.map(i => i(app)),
      // 通过require引入
      require,
      // 处理中间件路径
      i => `${r('./middleWares')}/${i}`
    ))
  }

  // 启动服务
  async start () {
    const host = process.env.HOST || '127.0.0.1'
    const port = process.env.PORT || 3000

    // Import and Set Nuxt.js options
    let config = require('../nuxt.config.js')
    config.dev = !(process.env === 'production')

    // Instantiate nuxt.js
    const nuxt = new Nuxt(config)

    // Build in development
    if (config.dev) {
      const builder = new Builder(nuxt)
      await builder.build()
    }

    this.app.use(async (ctx, next) => {
      await next()
      ctx.status = 200 // koa defaults to 404 when it sees that status is unset
      return new Promise((resolve, reject) => {
        ctx.res.on('close', resolve)
        ctx.res.on('finish', resolve)
        nuxt.render(ctx.req, ctx.res, promise => {
          // nuxt.render passes a rejected promise into callback on error.
          promise.then(resolve).catch(reject)
        })
      })
    })

    this.app.listen(port, host)
    console.log('Server listening on ' + host + ':' + port) // eslint-disable-line no-console
  }
}

const app = new Server()

app.start()
