const mongoose = require('mongoose');

const SupportRequestSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'userModel', 
  },
  request_id : {
    type : String
  },
  user_name : {
      type : String
  },
  serviceName: {
    type: String,
    enum: ['Pole Replacement', 'Cable Replacement', 'Power Outage', 'Water leak','Other'], 
  },
    issue_message : {
    type: String,
    
  },
  upload_photos : {
    type : [String]
  },

    address : {
           street : {
               type : String
           } ,
           city : {
              type : String
           } ,
           zip : {
              type : String
           },    
    },
  
  request_Date: {
    type: Date,
    default: Date.now
  },

  status: {
    type: String,
    enum: ['Pending', 'In Progress', 'Completed', 'Cancelled'],
    default: 'Pending'
  },
  
  contactDetails: {
    email: {
      type: String,
      
    },
    phoneNumber: {
      type: String,
     
    }
  }
} , {timestamps : true });

const support_request_model = mongoose.model('Support_request', SupportRequestSchema)
module.exports = support_request_model



