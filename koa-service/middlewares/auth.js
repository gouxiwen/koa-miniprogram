const {
  findBySessionKey
} = require('../lib/db/user')
module.exports = async function (context, next) {
  const sessionKey = context.get('x-session')
  context.logger.debug(`[auth] 获取到到sessionKey为${sessionKey}`)
  if (!sessionKey) {
    context.body = resObj(401, '请求头中未包含x-session')
  }
  const user = await findBySessionKey(sessionKey)
  if (user) {
    context.logger.debug(`[auth] 根据sessionKey查询到的用户为${JSON.stringify(user)}`)
    if (user.userType === -1) {
      context.body = resObj(401, '当前用户被禁用')
      return;
    }
    context.state.user = {
      id: user._id,
      name: user.name,
      avatar: user.avatar,
      isAdmin: user.userType === 1
    }
  } else {
    context.logger.info(`[auth] 根据sessionKey未获取到用户`)
    context.body= resObj(401, 'session 过期')
    return;
  }
  
  if (/^\/admin/i.test(context.url) && !context.state.user.isAdmin) {
    context.logger.info(`[auth] 当前的${context.url} 必须为管理员访问.`)
    context.body = resObj(401, '当前资源必须管理员才能访问')
    return;
  }
  await next()
}

function resObj(status, data) {
  return {
    status,
    data
  }
}