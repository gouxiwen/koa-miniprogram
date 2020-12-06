const mongoose = require('mongoose')
mongoose.set('useCreateIndex', true)
const {name, user, password} = require('../../config').db
module.exports = {
  open () {
    return mongoose.connect(name, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      // user: user,
      // pass: password,
      poolSize: 10
    })
  },
  close () {
    return mongoose.connection.close()
  }
}
