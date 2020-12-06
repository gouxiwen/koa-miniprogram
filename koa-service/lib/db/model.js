const mongoose = require('mongoose')

// 用户信息
const userSchema = new mongoose.Schema({
    openId: {           // 储存微信的openID
        type: String,
        index: true,    // 建立索引，查询用户
        unique: true    // 唯一约束
    },
    created: {
        type: Date,
        default: Date.now
    },
    lastLogin: {
        type: Date
    },
    name: {
        type: String,
        index: true
    },
    avatar: {
        type: String
    },
    userType: {
        type: Number,
        default: 0
    }
})
// 登录code
const codeSchema = new mongoose.Schema({
    code: {
      type: String
    },
    sessionKey: String
  })
  // 相册
  const albumSchema = new mongoose.Schema({
    userId: {
      type: String
    },
    name: {
      type: String
    }
  },
  {
    // 禁用版本控制
    versionKey: false,
    // 使用mongoose新增的内置时间戳记录创建和更新时间
    timestamps: { createdAt: 'created', updatedAt: 'updated' }
  })
  // 相片
  const photoSchema = new mongoose.Schema({
    userId: {
      type: String
    },
    url: {
      type: String
    },
    // 审核
    isApproved: {
      type: Boolean,
      default: true, // 建立管理后以后设为null
      index: true
    },
    albumId: {
      type: mongoose.Schema.Types.ObjectId
    },
    created: {
      type: Date,
      default: Date.now
    },
    isDelete: {
      type: Boolean,
      default: false
    }
  })
module.exports = {
    User: mongoose.model('User', userSchema),
    Code: mongoose.model('code', codeSchema),
    Album: mongoose.model('album', albumSchema),
    Phopto: mongoose.model('photo', photoSchema)
  }