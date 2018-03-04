/**
 * Created by:tm  Date:2018/3/3
 */
import xml2js from 'xml2js'
import template from './tpl'

/**
 * 暴露一个解析xml的方法
 */
function parseXML (xml) {
  return new Promise((resolve, reject) => {
    xml2js.parseString(xml, { trim: true },
      (err, content) => {
        if (err) reject(err)
        else resolve(content)
      })
  })
}

/**
 * 格式化消息
 * @param result 解析结果
 */
function formatMessage (result) {
  let message = {}

  if (typeof result === 'object') {
    const keys = Object.keys(result)
    for (let k of keys) {
      let item = result[k]
      if (!(item instanceof Array) || item.length === 0) {
        continue
      }
      if (item.length === 1) {
        let val = item[0]
        if (typeof val === 'object') {
          message[k] = formatMessage(val)
        } else {
          message[k] = (val || '').trim()
        }
      } else {
        message[k] = []
        for (let j of item) {
          message[k].push(formatMessage(j))
        }
      }
    }
  }
  console.log('处理前的result：', result)
  console.log('处理后的message：', message)
  return message
}

/**
 * 生成xml消息模板
 * @param content 消息内容
 * @param message 解析后的微信推送消息
 */
function tpl (content, message) {
  let type = 'text'

  console.log('传入content', content)
  // 如果是数组设置为news
  if (Array.isArray(content)) {
    type = 'news'
  }

  // 内容空
  if (!content) {
    content = 'Empty News'
  }

  // if (content && content.type) {
  //   type = content.type
  // }

  let info = Object.assign({}, {
    content: content,
    createTime: Date.now() / 1000,
    msgType: content.type || type,
    toUserName: message.FromUserName,
    fromUserName: message.ToUserName
  })

  return template(info)
}

export {
  parseXML,
  formatMessage,
  tpl
}
