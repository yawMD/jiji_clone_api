const mongoose = require('mongoose');

const ItemSchema = new mongoose.Schema({
    category:{
        type: 'string',
        required: true,
    },
    name:{
        type: 'string',
        required: true,
        unique: true
    },
    image:{
        type: 'string',
        required: true,
    }
})

module.exports = mongoose.model("ItemSchema", ItemSchema)