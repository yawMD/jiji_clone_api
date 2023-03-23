const mongoose = require('mongoose');


const ProductSchema = new mongoose.Schema({ 
    name: {
        type: String,
      },
      image: {
        type: Array,
        required: true,
      },
      category: {
        type: String,
        default: "uncategorized",
      },
      subcategory: {
        type: String,
        default: "uncategorized",
      },
      price:{
        type: Number,
        required: true,
      },
      description: {
        type:String,
      },
      breed: {
        type:String,
      },
      model: {
        type:String,
      },
      storage: {
        type:String,
      },
      meter: {
        type:String,
      },
      transmission: {
        type:String,
      },
      fuel:{
        type:String,
      },
      year:{
        type:String,
      },
      region:{
        type:String,
      },
      location: {
        type:String,
        required:true,
      },
      condition:{
        type:String,
      },
      type:{
        type:String,
      },
      brand:{
        type:String,
      },
      phone:{
        type:Number,
        required: true,
        trim:true
      },
      color:{
        type:String,
      },
      enabled: {
        type: Boolean,
        default: true,
      },
      request_by: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
},{timestamps: true})

module.exports = mongoose.model("ProductCategory", ProductSchema);