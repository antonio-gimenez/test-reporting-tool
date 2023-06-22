const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const mailSchema = new Schema(
  {
    name: {
      type: String,
      unique: true,
      trim: true,
    },
    recipientType: {
      type: String,
      trim: true,
      enum: ["to", "cc", "bcc"],
      default: "cc",
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



const Mail = mongoose.model("Mail", mailSchema);

module.exports = Mail;
