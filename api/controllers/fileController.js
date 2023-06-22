const { File } = require("../models/fileModel");
const { ScheduledTest } = require("../models/testModel");


const getFiles = async (req, res) => {
    const { id } = req.params;
    try {
      if (!id) {
        return res.status(400).send({ message: "Test `id` not provided" });
      }
      const test = await ScheduledTest.findById(id).populate("files");
  
      if (!test) return res.status(404).send({ message: `Test not found` });
  
      const files = test.files;
      if (files.length === 0) {
        return res.status(204).send({ message: "No files found" });
      }
  
      return res.status(200).send({ data: files });
    } catch (error) {
      return res.status(500).send({ message: `Error loading files: ${error}` });
    }
  };


  const uploadFilesToTest = async (req, res) => {
    const { id } = req.params;
    const filesToSave = [];
  
    console.log(req.params);
  
    console.log({files: req.files})
    if (!req.files) {
      console.log(`No files were uploaded.`);
    } else if (req.files && Array.isArray(req.files)) {
      console.log(`Files uploaded: ${req.files.length}`);
      req.files.forEach((file) => {
        const newFile = new File({
          name: file.originalname,
          file: file.buffer,
          size: file.size,
          contentType: file.mimetype,
        });
        filesToSave.push(newFile);
      });
      try {
        await File.insertMany(filesToSave);
        if (!filesToSave) {
          return res.status(400).send({ message: "Error saving files" });
        }
        await ScheduledTest.findByIdAndUpdate(id, { $push: { files: filesToSave } });
        res.status(200).send({ message: "Files uploaded successfully" });
      } catch (error) {
        console.log(error);
        return res.status(500).send({ message: "Error saving files" });
      }
    } else {
      console.log(`File uploaded: ${req.files.originalname}`);
      const newFile = new File({
        name: req.files.originalname,
        file: req.files.buffer,
        contentType: req.files.mimetype,
        size: req.files.size,
      });
      filesToSave.push(newFile);
      try {
        await newFile.save();
        if (!newFile) {
          return res.status(400).send({ message: "Error saving file" });
        }
        await ScheduledTest.findByIdAndUpdate(id, { $push: { files: newFile } });
        res.status(200).send({ message: "File uploaded successfully" });
      } catch (error) {
        console.log(error);
        return res.status(500).send({ message: "Error saving file" });
      }
    }
  };
  
  const removeFile = async (req, res) => {
    const { testId, fileId } = req.params;
    try {
      const deletedFile = await File.findById(fileId);
  
      if (!deletedFile) {
        return res.status(404).send({ message: "File not found in collection" });
        // throw new Error("File not found in collection");
      }
  
      await deletedFile.remove();
      if (deletedFile) {
        console.log("File deleted from collection");
      }
      // remove the file on the test
  
      const test = await ScheduledTest.findById(testId);
  
      if (!test) {
        return res.status(404).send({ message: "Test not found in collection" });
        // throw new Error("Test not found in collection");
      }
  
      const files = test.files;
  
      const fileIndex = files.findIndex((file) => file._id.toString() === fileId);
  
      console.log({ fileIndex });
  
      if (fileIndex === -1) {
        return res.status(404).send({ message: "File not found in test" });
        // throw new Error("File not found in test");
      }
  
      files.splice(fileIndex, 1);
  
      await test.save();
  
      return res.status(200).send({ message: "File deleted successfully" });
    } catch (error) {
      console.log(error);
      return res.status(400).send({ message: error.message });
    }
  };


  module.exports = {
    getFiles,
    uploadFilesToTest,
    removeFile,
    };