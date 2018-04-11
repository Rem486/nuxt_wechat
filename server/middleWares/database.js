/**
 * Created by:tm  Date:2018/2/28
 */
import mongoose from 'mongoose'
import config from '../config'
import { resolve } from 'path'
import fs from 'fs'

// 统一读取model 文件
const models = resolve(__dirname, '../database/schema')

fs.readdirSync(models)
  .filter(file => ~file.search(/^[^.].*js$/))
  .forEach(file => require(resolve(models, file)))

export const database = app => {
  // 配置debug
  mongoose.set('debug', true)
  // 连接数据库
  mongoose.connect(config.db)
  //  连接中断重连
  mongoose.connection.on('disconnected', () => {
    mongoose.connect(config.db)
  })
  //  连接错误
  mongoose.connection.on('error', err => {
    console.error(err)
  })
  //  连接成功
  mongoose.connection.on('open', async () => {
    console.log('Connected to mongoose')
  })
}
