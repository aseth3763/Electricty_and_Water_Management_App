const mongoose = require('mongoose')
const admin_Schema = new mongoose.Schema({
           name : {
              type : String
           },
           email : {
                 type : String
           },
           password : {
                type : String
           },
           phone_no : {
                type : Number
           },
           profileImage : {
                 type : String
           },
           status : {
               type : Number ,
               enum : [ 0 , 1 ],
               default : 1
           }
}, { timestamps : true })

const adminModel = mongoose.model('admin' , admin_Schema)
module.exports = adminModel