const mongoose = require('mongoose')
const service_Schema = new mongoose.Schema({
     
    service_type : {
        type : String,
        enum : ['Electricity' , 'Water' , 'Gas' , 'Waste Management' , 'Other' ],
     },     
       
     rate_per_unit : {
      type : Number, 
                       
   },
   //   electricity_details : {
   //             //   units_consumed : {
   //             //     type : Number,
                  
   //             //   },
   //               rate_per_unit : {
   //                  type : Number, 
                                     
   //               },
   //   },

   //   water_details : {
   //             // units_consumed : {
   //             //    type : Number,
                 
   //             // },
   //             rate_per_unit : {
   //                type : Number, 
                              
   //             },
   //   },

    status : {
     type : Number,
     enum : [ 1, 0 ],
     default : 1
   },
   flat_rate: {
      type: Number,
                            
  }
} , { timestamps : true })

const service_model = mongoose.model('service' , service_Schema)
module.exports = service_model