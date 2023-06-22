const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const { workflowSchema } = require("./workflowModel");

const scheduledTestSchema = new Schema(
  {
    testId: {
      type: String,
      minlength: 4,
      maxlength: 50,
      trim: true,
    },

    name: {
      type: String,
      required: true,
      maxlength: 50,
      trim: true,
    },
    requestor: {
      type: String,
      maxlength: 50,
      trim: true,
    },
    product: {
      type: String,
      required: true,
      maxlength: 50,
      trim: true,
    },
    branch: {
      type: String,
      required: true,
      maxlength: 50,
      trim: true,
    },
    files: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "File",
        required: false,
      },
    ],
    release: {
      type: String,
      required: true,
      minlength: 2,
      maxlength: 50,
      trim: true,
    },
    workflows: {
      type: [workflowSchema],
      required: true,
      versionKey: false,
    },
    machine: {
      type: String,
      maxlength: 50,
      trim: true,
      uppercase: true,
    },
    assignedTo: {
      type: String,
      maxlength: 50,
      default: "",
      trim: true,
    },
    instructions: {
      type: String,
      trim: true,
      maxlength: 1000,
    },
    notes: {
      type: String,
      trim: true,
      maxlength: 50000,
    },
    status: {
      type: String,
      trim: true,
      default: "Pending",
      enum: ["Pending", "Success", "Fail", "Skipped", "HW Error", "Warning", "Running"],
    },
    deleted: {
      type: Boolean,
      default: false,
    },
    deletedAt: {
      type: Date,
      default: null,
    },
    priority: {
      type: String,
      required: true,
      default: "Medium",
      enum: ["Low", "Medium", "High"],
    },
    createdAt: {
      type: Date,
      default: Date.now(),
    },
    scheduledTo: {
      type: Date,
      default: Date.now(),
      required: true,
    },
    completedAt: {
      type: Date,
      default: null,
    },
  },
  {
    versionKey: false,
  }
);

// set index to scheduledTestSchema, for each product set a unique index to TestId
// scheduledTestSchema.index({ product: 1, testId: 1 }, { unique: true });

// remove all indexes from all database collections
// db.getCollectionNames().forEach(function (c) {
//   db[c].dropIndexes();
// });

const ScheduledTest = mongoose.model("scheduledTest", scheduledTestSchema);

module.exports = {
  ScheduledTest,
};
