/**
 * Created by:tm  Date:2018/3/1
 */
/**
 * 管理微信库
 */
import rp from 'request-promise'
// import formstream from 'formstream'
import fs from 'fs'
import * as _ from 'lodash'

const base = 'https://api.weixin.qq.com/cgi-bin/'
const api = {
  accessToken: 'token?grant_type=client_credential',
  // 临时素材
  temporary: {
    upload: 'media/upload?',
    fetch: 'media/get?'
  },
//    永久素材
  permanent: {
    // 其它类型素材type 图片（image）、语音（voice）、视频（video）和缩略图（thumb）
    upload: 'material/add_material?',
    // 图文
    uploadNews: 'material/add_news?',
    // 图文消息内的图片
    uploadNewsImg: 'media/uploadimg?',
    fetch: 'material/get_material?',
    del: 'material/del_material?',
    update: 'material/update_news?',
    // 总数 图片和图文消息素材（包括单图文和多图文）的总数上限为5000，其他素材的总数上限为1000
    count: 'material/get_materialcount?',
    // 素材列表
    batch: 'material/batchget_material?'
  },
//  用户标签
  tag: {
    create: 'tags/create?',
    fetch: 'tags/get?',
    update: 'tags/update?',
    del: 'tags/delete?',
    fetchUsers: 'user/tag/get?',
    batchTag: 'tags/members/batchtagging?',
    batchUnTag: 'tags/members/batchuntagging?',
    getTagList: 'tags/getidlist?'
  },
  user: {
    remark: 'user/info/updateremark?',
    info: 'user/info?',
    batchInfo: 'user/info/batchget?',
    fetchUserList: 'user/get?',
    getBlackList: 'tags/members/getblacklist?',
    batchBlackUsers: 'tags/members/batchblacklist?',
    batchUnBlackUsers: 'tags/members/batchunblacklist?'
  },
  menu: {
    create: 'menu/create?',
    get: 'menu/get?',
    del: 'menu/delete?',
    addCondition: 'menu/addconditional?',
    delCondition: 'menu/delconditional?',
    getInfo: 'get_current_selfmenu_info?'
  },
  ticket: {
    get: 'ticket/getticket?'
  }
}

// 获取文件信息
function statFile (filepath) {
  return new Promise((resolve, reject) => {
    fs.stat(filepath, (err, stat) => {
      if (err) reject(err)
      else resolve(stat)
    })
  })
}

export default class Wechat {
  constructor (opts) {
    this.opts = Object.assign({}, opts)

    // 获取外部参数
    this.appID = opts.appID
    this.appSecret = opts.appSecret
    this.getAccessToken = opts.getAccessToken
    this.saveAccessToken = opts.saveAccessToken

    this.fetchAccessToken()
  }

  /**
   * 统一管理微信的异步
   */
  async request (options) {
    options = Object.assign({}, options, { url: base + options.url, json: true })
    console.log('请求的options', options)
    try {
      const response = await rp(options)
      // console.log('微信返回的res', response)
      return response
    } catch (e) {
      console.error(e)
    }
  }

  async fetchAccessToken () {
    // 使用外部方法获取token
    let data = await this.getAccessToken()

    // 不合法或失效
    if (!this.isValidAccessToken(data)) {
      data = await this.updateAccessToken()
    }

    await this.saveAccessToken(data)
    return data
  }

  /**
   * 更新token
   */
  async updateAccessToken () {
    const url = `${api.accessToken}&appid=${this.appID}&secret=${this.appSecret}`

    const data = await this.request({ url: url })
    const now = (new Date().getTime())

    data.expires_in = now + (data.expires_in - 20) * 1000
    console.log('更新token', data)
    return data
  }

  /**
   * 验证token
   */
  isValidAccessToken (data) {
    if (!data || !data.access_token || !data.expires_in) {
      return false
    }

    const expiresIn = data.expires_in
    const now = (new Date().getTime())

    // 判断时间是否失效
    return now < expiresIn
  }

  /**
   * 统一上传
   */
  async handleUpload (operation, ...args) {
    console.log(operation, args)
    const token = await this.fetchAccessToken()
    const options = this[operation](token.access_token, ...args)
    const data = await this.request(options)
    console.log('data', data)
    return data
  }

  /**
   * 封装上传素材的options
   * @param token
   * @param type
   * @param material
   * @param permanent 永久素材 默认临时
   */
  uploadMaterial (token, type, material, permanent) {
    let form = {}
    // 默认临时素材
    let url = api.temporary.upload
    if (permanent) {
      url = api.permanent.upload
      _.extend(form, permanent)
    }

    if (type === 'pic') {
      url = api.permanent.uploadNewsPic
    } else if (type === 'news') {
      url = api.permanent.uploadNews
      form = material
    } else {
      //  视频这些，构建表单
      form.media = fs.createReadStream(material)
      // const stat = await statFile(material)
      // form.file('media', material, path.basename(material), stat.size)
    }

    // 路径拼接token
    let uploadUrl = url + 'access_token=' + token

    if (!permanent) {
      uploadUrl += '&type=' + type
    } else {
      // 不是图文，表单数据才赋值token
      if (type !== 'news') {
        form.access_token = token
      }
      // form.field('access_token', access_token)
    }

    // 请求配置
    const options = {
      method: 'POST',
      url: uploadUrl,
      json: true
    }

    if (type === 'news') {
      options.body = form
    } else {
      options.formData = form
    }
    console.log('封装好的options', options)
    return options
  }

  /**
   * 获取素材
   */
  fetchMaterial (token, mediaId, type, permanent) {
    let form = {}
    // 默认临时
    let fetchUrl = api.temporary.fetch

    if (permanent) {
      fetchUrl = api.permanent.fetch
    }

    let url = fetchUrl + 'access_token=' + token
    // let options = { method: 'POST', url: url }

    if (permanent) {
      form.media_id = mediaId
      form.access_token = token
      // options.body = form
    } else {
      if (type === 'video') {
        // 官方使用http
        url = url.replace('https://', 'http://')
      }

      url += '&media_id=' + mediaId
    }

    return { method: 'POST', url: url, body: form }
  }

  /**
   * 删除素材
   * @param token
   * @param mediaId
   * @returns {{method: string, url: string, body: {media_id: *}}}
   */
  deleteMaterial (token, mediaId) {
    const form = {
      media_id: mediaId
    }
    const url = api.permanent.del + 'access_token=' + token + '&media_id' + mediaId

    return { method: 'POST', url: url, body: form }
  }

  /**
   * 更新素材
   * @param token
   * @param mediaId
   * @param news
   * @returns {{method: string, url: string, body: {media_id: *}}}
   */
  updateMaterial (token, mediaId, news) {
    const form = {
      media_id: mediaId
    }

    _.extend(form, news)
    const url = api.permanent.update + 'access_token=' + token + '&media_id=' + mediaId

    return { method: 'POST', url: url, body: form }
  }

  /**
   * 获取素材数量
   * @param token
   * @returns {{method: string, url: string}}
   */
  countMaterial (token) {
    const url = api.permanent.count + 'access_token=' + token

    return { method: 'POST', url: url }
  }

  /**
   * 获取素材列表
   * @param token
   * @param options
   * @returns {{method: string, url: string, body: *}}
   */
  batchMaterial (token, options) {
    options.type = options.type || 'image'
    options.offset = options.offset || 0
    options.count = options.count || 10

    const url = api.permanent.batch + 'access_token=' + token

    return { method: 'POST', url: url, body: options }
  }

  createTag (token, name) {
    const form = {
      tag: {
        name: name
      }
    }
    const url = api.tag.create + 'access_token=' + token

    return {method: 'POST', url: url, body: form}
  }

  fetchTags (token) {
    const url = api.tag.fetch + 'access_token=' + token

    return {url: url}
  }

  updateTag (token, tagId, name) {
    const form = {
      tag: {
        id: tagId,
        name: name
      }
    }

    const url = api.tag.update + 'access_token=' + token

    return {method: 'POST', url: url, body: form}
  }

  delTag (token, tagId) {
    const form = {
      tag: {
        id: tagId
      }
    }

    const url = api.tag.del + 'access_token=' + token

    return {method: 'POST', url: url, body: form}
  }

  fetchTagUsers (token, tagId, openId) {
    const form = {
      tagid: tagId,
      next_openid: openId || ''
    }
    const url = api.tag.fetchUsers + 'access_token=' + token

    return {method: 'POST', url: url, body: form}
  }

  // unTag true|false
  batchTag (token, openIdList, tagId, unTag) {
    const form = {
      openid_list: openIdList,
      tagid: tagId
    }
    let url = api.tag.batchTag

    if (unTag) {
      url = api.tag.batchUnTag
    }

    url += 'access_token=' + token

    return {method: 'POST', url: url, body: form}
  }

  getTagList (token, openId) {
    const form = {
      openid: openId
    }
    const url = api.tag.getTagList + 'access_token=' + token

    return {method: 'POST', url: url, body: form}
  }

  remarkUser (token, openId, remark) {
    const form = {
      openid: openId,
      remark: remark
    }
    const url = api.user.remark + 'access_token=' + token

    return {method: 'POST', url: url, body: form}
  }

  /**
   * 获取用户的基本信息，不同的人在同一个公众号openid不一样，
   * 同一个人不同公众号openid也不一样，
   * 要标志唯一用户使用UnionID
   * @param token
   * @param openId
   * @param lang
   * @returns {{url: string}}
   */
  getUserInfo (token, openId, lang) {
    const url = `${api.user.info}access_token=${token}&openid=${openId}&lang=${lang || 'zh_CN'}`

    return {url: url}
  }

  batchUserInfo (token, userList) {
    const url = api.user.batchInfo + 'access_token=' + token
    const form = {
      user_list: userList
    }

    return {method: 'POST', url: url, body: form}
  }

  fetchUserList (token, openId) {
    const url = `${api.user.fetchUserList}access_token=${token}&next_openid=${openId || ''}`

    return {url: url}
  }

  createMenu (token, menu) {
    const url = api.menu.create + 'access_token=' + token

    return {method: 'POST', url: url, body: menu}
  }

  getMenu (token) {
    const url = api.menu.get + 'access_token=' + token

    return {url: url}
  }

  delMenu (token) {
    const url = api.menu.del + 'access_token=' + token

    return {url: url}
  }

  addConditionMenu (token, menu, rule) {
    const url = api.menu.addCondition + 'access_token=' + token
    const form = {
      button: menu,
      matchrule: rule
    }

    return {method: 'POST', url: url, body: form}
  }

  delConditionMenu (token, menuId) {
    const url = api.menu.delCondition + 'access_token=' + token
    const form = {
      menuid: menuId
    }

    return {method: 'POST', url: url, body: form}
  }

  getCurrentMenuInfo (token) {
    const url = api.menu.getInfo + 'access_token=' + token

    return {url: url}
  }

  // sign (ticket, url) {
  //   return sign(ticket, url)
  // }
}
