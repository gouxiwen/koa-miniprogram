exports.responseOK  = async function (ctx, next) {
  ctx.body = {
    status: 200
  }
  await next()
}
exports.getPageParams = function (context) {
  return {
    pageIndex: parseInt(context.query.pageIndex) || 1,
    pageSize: parseInt(context.query.pageSize) || 10
  }
}