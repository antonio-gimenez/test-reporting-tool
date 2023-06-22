// create a new mongoose model to store a image with type string
var mongoose = require("mongoose");
var Schema = mongoose.Schema;

const fileSchema = new Schema(
  {
    file: {
      type: Buffer,
    },
    contentType: String,
    createdAt: {
      type: Date,
      default: Date.now,
    },
    name: {
      type: String,
      default: "Untitled",
    },
    size: {
      type: Number,
      required: true,
    },
  },
  { versionKey: false }
);

const File = mongoose.model("File", fileSchema);

module.exports = { File, fileSchema };
