const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const presetSchema = new Schema(
  {
    name: {
      type: String,
      maxlength: 100,
      trim: true,
    },
    content: {
      type: String,
      maxlength: 5000,
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
  },
  {
    versionKey: false,
  }
);


const Preset = mongoose.model("Preset", presetSchema);

module.exports = {
  Preset,
};
