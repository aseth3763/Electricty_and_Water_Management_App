const mongoose = require('mongoose');

const addressRequestSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'userModel',
   
  },
  newAddress: {
    street: {
      type: String,
     
    },
    city: {
      type: String,
     
    },
    zip: {
      type: Number,
     
    }
  },
  idProof: {
    type: String,    
  },

  status: {
    type: String,
    enum: ['Pending', 'Processed', 'Rejected'],
    default: 'Pending'
  },
  
} , { timestamps : true });

const address_update_model =  mongoose.model('AddressRequest', addressRequestSchema);
module.exports = address_update_model
