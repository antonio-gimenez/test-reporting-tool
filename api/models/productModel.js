const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const productSchema = new Schema(
  {
    name: {
      type: String,
      unique: true,
      index: true,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 100,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
    active: {
      type: Boolean,
      default: true,
    },
    locked: {
      type: Boolean,
      default: false,
    },
    testrailUrl: {
      type: String,
    },
  },
  { versionKey: false }
);


const Product = mongoose.model("Product", productSchema);

module.exports = Product;
