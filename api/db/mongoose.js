const mongoose = require('mongoose')
// const validator = require("validator")
//
mongoose.connect('mongodb://127.0.0.1:27017/jiji', {
    useNewUrlParser: true,
    useUnifiedTopology: true
})


mongoose.connection.on('connected', () => {
    console.log('Mongo has connected succesfully')
  })
  mongoose.connection.on('reconnected', () => {
    console.log('Mongo has reconnected')
  })
  mongoose.connection.on('error', error => {
    console.log('Mongo connection has an error', error)
    mongoose.disconnect()
  })
  mongoose.connection.on('disconnected', () => {
    console.log('Mongo connection is disconnected')
  })

//   {!isAuth() ? null : isAuth().type !== "admin" ? (
//     router.push('/')
//  ) : (
//    router.push('/admin') 
//  )}