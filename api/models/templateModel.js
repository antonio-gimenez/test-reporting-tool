const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const workflowSchema = new Schema(
  {
    workflowName: {
      type: String,
      required: true,
      trim: true,
    },
    workflowDescription: {
      type: String,
      required: true,
      trim: true,
    },
  },
  {
    versionKey: false,
  }
);

const templateSchema = new Schema(
  {
    name: {
      type: String,
      unique: false,
      required: true,
      trim: true,
    },
    workflows: [workflowSchema],
    // product is a reference to the product model
    // if the original product is modified, the template will not be affected
    product: {
      type: Schema.Types.ObjectId,
      ref: "Product",
      required: true,
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

const Template = mongoose.model("Template", templateSchema);

module.exports = { Template };
