const env = process.env
const appKey = env.APP_KET || 'wx466b012d9eb14747'
const appSecret = env.APP_SECRET || '3d99d11dfc58beb5a704f8d71e0c3e9f'
const nodeEnv = env.NODE_ENV
let db = {
  name: 'mongodb://127.0.0.1:27017/xcx',
  user: 'user',
  password: 'pass'
}
if (nodeEnv === 'production') {
  db = {
    name: 'mongodb://127.0.0.1:27017/xcx',
    user: 'user',
    password: 'pass'
  }
}

module.exports = {
  appKey,
  appSecret,
  db
}
