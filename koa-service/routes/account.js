const router = require('koa-router')()
const account = require('../controller/account')
const {responseOK, getPageParams} = require('./utils');
const auth = require('../middlewares/auth')

/**
 * 小程序登陆，接收小程序登陆获取的code
 */
router.get('/login', async (context, next) => {
  const code = context.query.code
  context.logger.info(`[login] 用户登陆Code为${code}`)
  context.body = {
    status: 0,
    data: await account.login(code)
  }
})
/**
 * 修改用户信息
 */
router.put('/user', auth, async (context, next) => {
  context.logger.info(`[user] 修改用户信息, 用户ID为${context.state.user.id}, 修改的内容为${JSON.stringify(context.request.body)}`)
  await account.update(context.state.user.id, context.request.body)
  await next()
}, responseOK)

/**
 * 获取当前登陆的用户信息
 */
router.get('/my', auth, async (context, next) => {
  context.body = {
    status: 0,
    data: context.state.user
  }
})
/**
 * 扫码登陆，获取二维码字符串
 */
router.get('/login/ercode', async (context, next) => {
  context.logger.debug(`[login] 生成登陆二维码`)
  context.body = {
    status: 0,
    data: await account.getErCode()
  }
})
/**
 * 扫码登陆中，小程序侧调用的接口。将扫到的二维码信息传递过来
 */
router.get('/login/ercode/:code', auth, async (context, next) => {
  const code = context.params.code
  const sessionKey = context.get('x-session')
  await account.setSessionKeyForCode(code, sessionKey)
  await next()
}, responseOK)
/**
 * 轮询检查登陆状态
 */
router.get('/login/errcode/check/:code', async (context, next) => {
  const startTime = Date.now()
  async function login () {
    const code = context.params.code
    const sessionKey = await account.getSessionKeyByCode(code)
    if (sessionKey) {
      context.body = {
        status: 0,
        data: {
          sessionKey: sessionKey
        }
      }
    } else {
      if (Date.now() - startTime < 10000) {
        await new Promise((resolve) => {
          process.nextTick(() => {
            resolve()
          })
        })
        await login()
      } else {
        context.body = {
          status: -1
        }
      }
    }
  }
  await login()
})
// 后台管理
/**
 * 设置管理员 type
 * 1管理员
 * -1禁用用户
 * 0普通用户
 */
router.get('admin/user/:id/userType/:type', async (context, next) => {
  const body = {
    status: 0,
    data: await account.setUserType(context.params.id, context.params.type)
  }
  context.body = body
  await next()
})
/**
 * 获取用户列表
 * type的值的类型为：
 * admin: 管理员
 * blocked: 禁用用户
 * ordinary: 普通用户
 * all: 全部用户
 */
router.get('/admin/user/:type', async (context, next) => {
  const pageParams = getPageParams(context)
  context.body = {
    status: 0,
    data: await account.getUsersByType(context.params.type, pageParams.pageIndex, pageParams.pageSize)
  }
  await next()
})
/**
 * 修改用户类型，userType=1 为管理员， -1 未禁用用户
 */
router.put('/admin/user/:id', async (context, next) => {
  const body = {
    status: 0,
    data: await account.update(context.params.id, context.request.body)
  }
  context.body = body
  await next()
})

module.exports = router
