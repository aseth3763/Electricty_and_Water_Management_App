const mongoose = require('mongoose')

const admin_NotificationSchema = new mongoose.Schema({          
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
              default : 1
           },
           date: {
            type: Date,          
        },
}, {timestamps : true })

const adminNotificationModel = mongoose.model('admin_Notification', admin_NotificationSchema)

module.exports = adminNotificationModel