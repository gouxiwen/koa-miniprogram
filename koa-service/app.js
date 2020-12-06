const Koa = require('koa')
const app = new Koa()
const views = require('koa-views')
const json = require('koa-json')
const onerror = require('koa-onerror')
const bodyparser = require('koa-bodyparser')
const logger = require('koa-logger')

const index = require('./routes/index')
const account = require('./routes/account')
const photo = require('./routes/photo')
const {open} = require('./lib/db/connect')
const loggers = require('./middlewares/log')
// error handler
onerror(app)
open()
app.use(loggers)  // log4.js日志中间件ctx.info/ctx.debugs/...
// middlewares
app.use(bodyparser({
  enableTypes:['json', 'form', 'text']
}))
app.use(json())
app.use(logger()) // 开发时控制台输出请求日志
// <-- GET /stylesheets/style.css
// --> GET /stylesheets/style.css 200 4ms 111b
app.use(require('koa-static')(__dirname + '/public'))

app.use(views(__dirname + '/views', {
  extension: 'nunjucks'
}))

// logger
app.use(async (ctx, next) => {
  const start = new Date()
  await next()
  const ms = new Date() - start
  console.log(`${ctx.method} ${ctx.url} - ${ms}ms`)
})

// routes
app.use(index.routes(), index.allowedMethods())
app.use(account.routes(), account.allowedMethods())
app.use(photo.routes(), photo.allowedMethods())

// error-handling
app.on('error', (err, ctx) => {
  console.error('server error', err, ctx)
});

module.exports = app
