const mongoose = require('mongoose')
const report_problem_Schema = new mongoose.Schema({
       userId : {
           type : mongoose.Schema.Types.ObjectId,
           ref : 'userModel'
       },
       user_name : {
           type : String
       },

       problemType: {
        type: String,
        enum: ['Fallen Pole', 'Damaged Cable', 'Power Outage', 'Water Leak', 'Others'], 
          },
        
          Description : {
                 type : String
          },
          problem_photo : {
                type : [String]
        },
        status: {
            type: String,
            enum: ['Pending', 'In Progress', 'Resolved' , 'Rejected'],
            default: 'Pending'
          },
          date_of_incident : {
              type : Date
          },
        address : {
                  street : {
                     type : String
                  },
                  city : {
                     type : String
                  },
                  zip : {
                      type : String
                  }
        },
}, { timestamps : true })

const   report_problem_Model = mongoose.model('report_problem' , report_problem_Schema)

module.exports = report_problem_Model