const mongoose = require('mongoose')
const { modelName } = require('./userModel')
const faq_support_Schema = new mongoose.Schema({
        question : {
               type : String
        },
        answer : {
               type : String
        },
        status :  {
               type : Number,
               enum : [ 1 , 0],
               default : 1
        },
}, { timestamps : true })

const faq_support_Model = mongoose.model('FAQ_support', faq_support_Schema)

module.exports = faq_support_Model