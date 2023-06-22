const { ScheduledTest } = require("../models/testModel");

const getArchivedTests = async (req, res) => {
  const { page = 1, limit = 50 } = req.query;

  try {
    const query = {
      deleted: true,
    };

    const count = await ScheduledTest.countDocuments(query);

    const skip = (page - 1) * limit;

    const archivedTests = await ScheduledTest.find(query).skip(skip).limit(limit).sort({ deletedAt: -1 });

    if (!archivedTests) {
      return res.status(404).send({ message: "No archived tests found" });
    }

    res.status(200).send({
      tests: archivedTests,
      currentPage: page,
      totalTests: count,
    });
  } catch (error) {
    res.status(400).send(error);
  }
};

const restoreArchivedTest = async (req, res) => {
  const { id } = req.body;
  try {
    const test = await ScheduledTest.findById(id);
    if (!test) {
      return res.status(404).send({ message: `Test not found` });
    }
    test.deleted = false; // Update deleted field
    const updatedTest = await test.save(); // Save updated document
    res.status(200).send(updatedTest);
  } catch (error) {
    res.status(500).send({ message: `Error restoring test: ${error.message}` });
  }
};

const deleteArchivedTest = async (req, res) => {
  const { id } = req.params;
  try {
    const test = await ScheduledTest.findById(id);
    if (!test) {
      return res.status(404).send({ message: `Test not found` });
    }
    await ScheduledTest.deleteOne({ _id: id }); // Delete document from database
    res.status(200).send({ message: `Test deleted successfully` });
  } catch (error) {
    res.status(500).send({ message: `Error deleting test: ${error.message}` });
  }
};

const emptyArchivedTests = async (req, res) => {
  try {
    await ScheduledTest.deleteMany({ deleted: true }); // Delete all archived tests from database
    res.status(200).send({ message: `Archived tests deleted successfully` });
  } catch (error) {
    res.status(500).send({ message: `Error deleting archived tests: ${error.message}` });
  }
};

module.exports = { getArchivedTests, restoreArchivedTest, deleteArchivedTest, emptyArchivedTests };
