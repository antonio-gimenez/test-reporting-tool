const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// Function to create the update history schema
const createHistorySchema = (schema) => {
  schema.add({
    updateHistory: [
      {
        date: {
          type: Date,
          default: Date.now,
        },
        data: {
          type: Schema.Types.Mixed,
        },
      },
    ],
  });
};

// Middleware to add update history to a document
const updateHistoryMiddleware = function (schema) {
  // Check if updateHistory field is defined on schema
  if (!schema.path("updateHistory")) {
    createHistorySchema(schema);
  }

  const hookTypes = ["updateOne", "updateMany", "findOneAndUpdate", "findByIdAndUpdate"];

  schema.pre(hookTypes, async function (next) {
    try {
      // Get the document being updated
      const docToUpdate = await this.model.findOne(this.getQuery());
      if (!docToUpdate) {
        return next(new Error("Document not found"));
      }
      // Get the updated fields
      const updatedFields = this.getUpdate();
      // Create an update object for the update history
      const updateObject = {
        date: new Date(),
        data: {},
      };

      // Loop through each updated field and add it to the update object
      for (let field in updatedFields) {
        let newValue = updatedFields[field];
        // If the field is not being updated, skip it
        if (docToUpdate[field] === newValue) {
          continue;
        }

        // If the field is a date, convert it to a date object
        if (field === "updatedAt" && typeof newValue === "number") {
          newValue = new Date(newValue);
        }
        updateObject.data[field] = {
          oldValue: docToUpdate[field],
          newValue,
        };
      }

      // updateObject.data[field] = {
      //   oldValue: docToUpdate[field],
      //   newValue: updatedFields[field],
      // };
      // for (let field in updatedFields) {
      //   updateObject.data[field] = {
      //     oldValue: docToUpdate[field],
      //     newValue: updatedFields[field],
      //   };
      // }
      this.update({}, { $push: { updateHistory: updateObject } });
      next();
    } catch (error) {
      next(error);
    }
  });
};

module.exports = {
  updateHistoryMiddleware,
  createHistorySchema,
};
