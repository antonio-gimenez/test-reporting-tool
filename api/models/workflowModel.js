const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const workflowSchema = new Schema(
  {
    workflowName: {
      type: String,
      required: true,
      maxlength: 50,
      default: null,
      trim: true,
    },
    workflowDescription: {
      type: String,
      required: true,
      maxlength: 10000,
      default: null,
      trim: true,
    },
    machine: {
      type: String,
      maxlength: 50,
      trim: true,
      default: null,
      uppercase: true,
    },
    session: {
      type: Number,
      default: null,
      trim: true,
    },
    trolley: {
      type: String,
      default: null,
      trim: true,
    },
    content: {
      type: String,
      maxlength: 50000,
      default: "",
      trim: true,
    },
    status: {
      type: String,
      maxlength: 50,
      trim: true,
      default: "Pending",
    },
    ipAddress: {
      type: String,
      maxlength: 50,
      trim: true,
      default: null,
    },
  },
  { versionKey: false }
);

const Workflow = mongoose.model("Workflow", workflowSchema);

module.exports = {
  Workflow,
  workflowSchema,
};
