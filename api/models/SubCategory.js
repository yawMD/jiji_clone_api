const mongoose = require("mongoose");

const SubCategorySchema = new mongoose.Schema({
  category: {
    type: String,
    required: true,
  },
  title: {
    type: String,
    required: true,
    unique: true
  },
  image: {
    type: String,
    required: true,
  },
  enabled: {
    type: Boolean,
    default: true,
  },
});

module.exports = mongoose.model("SubCategory", SubCategorySchema);
