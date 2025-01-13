const mongoose = require('mongoose')
const admin_otp_schema = new mongoose.Schema({
      adminId : {
              type : mongoose.Schema.Types.ObjectId,
              ref : 'adminModel'
      },

      otp : {
         type : String
      },
}, {
     timestamps : true 
})

const admin_otp_model = mongoose.model('admin_otp' , admin_otp_schema)

module.exports = admin_otp_model