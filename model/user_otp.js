const mongoose = require('mongoose')
const user_otp_schema = new mongoose.Schema({
      userId : {
              type : mongoose.Schema.Types.ObjectId,
              ref : 'userModel'
      },

      otp : {
         type : String
      },
}, {
     timestamps : true 
})

const user_otp_model = mongoose.model('user_otp' , user_otp_schema)

module.exports = user_otp_model