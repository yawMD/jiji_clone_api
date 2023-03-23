const mongoose = require('mongoose');

const TrendingSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
      },
      image: {
        type: String,
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
        required: true,
      },
      condition:{
        type:String,
        required: true,
      },
      type:{
        type:String,
        required: true,
      },
      brand:{
        type:String,
        required: true,
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

module.exports = mongoose.model("Trending", TrendingSchema);
