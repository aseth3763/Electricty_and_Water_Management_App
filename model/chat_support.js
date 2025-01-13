const mongoose = require("mongoose")

const chat_support_schema = new mongoose.Schema({
    supportAgentId : {
        type : mongoose.Schema.Types.ObjectId,
        ref : 'admin'
    },
    supportAgentName : String,
    userId : {
        type : mongoose.Schema.Types.ObjectId,
        ref : 'user'
    },
    userName  :String,
    message : String,
    attachment : [String],
    isAdmin : {
        type : Number,
        enum : [0,1],
        default : 0  // For user
    },
    status : {
        type : Number ,
        enum : [0,1],
        default : 1
    }
},{timestamps:true})

const chat_support_model = mongoose.model("chatSupport",chat_support_schema);

module.exports = chat_support_model;
