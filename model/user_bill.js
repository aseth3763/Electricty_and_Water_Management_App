const mongoose = require('mongoose')
const Bill_Schema = new mongoose.Schema({
      userId : {
            type : mongoose.Schema.Types.ObjectId,
            ref : 'userId',
      },
      service : {
             type : mongoose.Schema.Types.ObjectId,
             ref : 'service',
      },
      service_type : {
        type : String
      },
      unit_consumed : {
         type : Number
      },
      billing_period: {
        start_date: { type: Date, required: true },
        end_date: { type: Date, required: true }
    },
    total_amount: {
        type: Number,
        required: true
    },
    due_date : {
         type : Date
    },
    payment_date : {
         type : String
    },
    bill_status : {
        type : String,
        enum : ['paid' , 'pending' , 'overdue'],
        defalt : 'pending'
    },
    bill_pdf : {
           type : String
    }
},
{
    timestamps : true 
})

const Bill_Model = mongoose.model('Bill', Bill_Schema)

module.exports = Bill_Model