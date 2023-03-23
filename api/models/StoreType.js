const mongoose = require('mongoose');

const StoreSchema = new mongoose.Schema({
    name:{
        type: 'string',
        required: true,
        unique: true
    },
    image:{
        type: 'string',
        required: true
    },
    enabled: {
        type: Boolean,
        default: true,
      },
      request_by: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      }
},{timestamps: true})

module.exports =  mongoose.model("Store", StoreSchema);