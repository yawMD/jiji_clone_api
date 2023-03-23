const mongoose = require('mongoose');

const ItemList = new mongoose.Schema({
    category:{
        type: 'string',
        required: true
    },
    subcategory:{
        type: 'string',
        required: true
    },
    store: {
        type: 'string',
        required: true
    },
    name: {
        type: 'string',
        required: true
    },
    image: {
        type: 'string',
        required: true
    },
    price: {
        type: 'number',
        required: true
    },
    item_by:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
    }
})

module.exports = mongoose.model('ItemList',ItemList)