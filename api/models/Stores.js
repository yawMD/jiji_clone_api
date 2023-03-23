const mongoose = require('mongoose');

const Stores = new mongoose.Schema({
    category:{
        type: 'string',
        required: true
    },
    name:{
        type: 'string',
        required: true
    },
    image:{
        type: 'string',
        required: true
    },
    location:{
        type: 'string',
        required: true
    },
    request_by: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
   }
})

module.exports = mongoose.model("Storeschema", Stores)