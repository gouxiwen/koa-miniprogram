const router = require('koa-router')()
const photo = require('../controller/photo')
const {responseOK, getPageParams} = require('./utils');
const uuid = require('uuid')
const multer = require('koa-multer')
const path = require('path')
const auth = require('../middlewares/auth')
/**
 * 获取相册列表
 */
router.get('/album', auth, async (context, next) => {
  const pageParams = getPageParams(context)
  const albums = await photo.getAlbums(context.state.user.id, pageParams.pageIndex, pageParams.pageSize)
  context.body = {
    data: albums,
    status: 0
  }
})
/**
 * 小程序种获取相册列表
 */
router.get('/xcx/album', auth, async (context, next) => {
  const albums = await photo.getAlbums(context.state.user.id)
  context.body = {
    data: albums,
    status: 0
  }
})
/**
 * 获取某个相册的相片列表
 */
router.get('/album/:id', auth, async (context, next) => {
  const pageParams = getPageParams(context)
  const photos = await photo.getPhotos(context.state.user.id, context.params.id, pageParams.pageIndex, pageParams.pageSize)
  context.body = {
    status: 0,
    data: photos
  }
})
/**
 * 小程序种获取相册的相片列表
 */
router.get('/xcx/album/:id', auth, async (context, next) => {
  const photos = await photo.getPhotos(context.state.user.id, context.params.id)
  context.body = {
    status: 0,
    data: photos
  }
})
/**
 * 添加相册
 */
router.post('/album', auth, async (context, next) => {
  const {
    name
  } = context.request.body
  await photo.addAlbum(context.state.user.id, name)
  await next()
}, responseOK)
/**
 * 修改相册
 */
router.put('/album/:id', auth, async (context, next) => {
  await photo.updateAlbum(context.params.id, context.body.name, ctx.state.user)
  await next()
}, responseOK)
/**
 * 删除相册
 */
router.del('/album/:id', auth, async (context, next) => {
  await photo.deleteAlbum(context.params.id)
  await next()
}, responseOK)


const storage = multer.diskStorage({
  destination: path.join(__dirname, '../public/uploads'),
  filename (req, file, cb) {
    const ext = path.extname(file.originalname)
    cb(null, uuid.v4() + ext)
  }
})
const uplader = multer({
  storage: storage
})
/**
 * 上传相片
 */
router.post('/photo', auth, uplader.single('file'), async (context, next) => {
  const {
    file
  } = context.req
  const {
    id
  } = context.req.body
  await photo.add(context.state.user.id, `http://192.168.1.101:3001/uploads/${file.filename}`, id)
  await next()
}, responseOK)
/**
 * 删除相片
 */
router.delete('/photo/:id', auth, async (context, next) => {
  const p = await photo.getPhotoById(context.params.id)
  if (p) {
    if (p.userId === context.state.user.id || context.state.user.isAdmin) {
      await photo.delete(context.params.id)
    } else {
      context.throw(403, '该用户无权限')
    }
  }
  await next()
}, responseOK)

// 后台管理
/**
 * 按照状态获取相片列表，type类型如下：
 * pending：待审核列表
 * accepted：审核通过列表
 * rejected：审核未通过列表
 * all: 获取所有列表
 */
router.get('/admin/photo/:type', auth, async (context, next) => {
    const pageParams = getPageParams(context)
    const photos = await photo.getPhotosByType(context.params.type, pageParams.pageIndex, pageParams.pageSize)
    context.body = {
      status: 0,
      data: photos
    }
})

/**
 * 修改照片信息
 */
router.put('/admin/photo/:id/', auth, async (context, next) => {
  if (context.state.user.isAdmin) {
    await photo.updatePhoto(context.params.id, context.request.body)
  } else {
    context.throw(403, '该用户无权限')
  }
  await next()
}, responseOK)

module.exports = router
