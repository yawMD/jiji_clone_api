const mongoose = require("mongoose");

const CategoriesSchema = new mongoose.Schema({
  title: {
    type: String,
    unique: true,
    required: true,
  },
  image: {
    type: String,
    required: true,
  },
  date_added: {
    type: Number,
    default: Date.now(),
  },
});

module.exports = mongoose.model("Categories", CategoriesSchema);
