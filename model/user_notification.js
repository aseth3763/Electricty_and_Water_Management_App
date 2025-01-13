const mongoose = require('mongoose')
const notificationSchema = new mongoose.Schema({
      
          userId : {           
                type: mongoose.Schema.Types.ObjectId,
                ref: 'userModel'
            }, 
          
           title :
           {
            type : String
           } ,

           message : {
            type : String
           },

           status : {
              type : Number,
              enum : [1 ,0],
              default : 0
           },

           date: {
            type: Date,          
        },
}, {timestamps : true })

 const userNotificationModel = mongoose.model('user_notification', notificationSchema)

 module.exports = userNotificationModel