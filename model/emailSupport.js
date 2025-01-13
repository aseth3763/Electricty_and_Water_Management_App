const mongoose = require('mongoose')
const emailSupport_schema = new mongoose.Schema({
        userId : {
                type : mongoose.Schema.Types.ObjectId,
                ref : 'userId'
        },
        to : {
              type : [String]
        },
        from : {
            type : String
        },
        subject : {
               type : String
        },
        email_message : {
              type : String
        },
        attachment : {
               type : [String]
        },
        status : {
               type : Number,
               enum : [ 0 ,1 ] ,
               default : 1
        },
}, { timestamps : true })

const emailSupport_model = mongoose.model('emailSupport', emailSupport_schema)

module.exports = emailSupport_model
