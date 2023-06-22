const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const branchSchema = new Schema(
  {
    name: {
      type: String,
      unique: true,
      maxlength: 100,
      trim: true,
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
  },
  {
    versionKey: false,
  }
);


const Branch = mongoose.model("Branch", branchSchema);

module.exports = { Branch };
