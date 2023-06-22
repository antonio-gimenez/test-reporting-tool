const { File } = require("../models/fileModel");
const { ScheduledTest } = require("../models/testModel");

const zeroPad = (num, places) => {
  // Add zeros to the front of a string
  const zero = places - num.toString().length + 1;
  return Array(+(zero > 0 && zero)).join("0") + num;
};

const stripNonNumeric = (str) => {
  // Remove all non-numeric characters from a string.
  return str.replace(/\D/g, "");
};

const stripNumeric = (str) => {
  // Remove all numeric characters from a string.
  const splitStr = str.split("-");
  return splitStr[0];
};

const countPlusOne = (count) => {
  // Increment a count by one.
  const nonCount = stripNumeric(count);
  const countStr = stripNonNumeric(count);
  const countInt = parseInt(countStr);
  const incrementedCount = countInt + 1;
  const countStrPlusOne = zeroPad(incrementedCount, countStr.length);
  return `${nonCount}-${countStrPlusOne}`;
};

const generateTestId = async (product) => {
  let lastTestId = await ScheduledTest.findOne({ product }, { testId: 1 })
    .sort({ testId: -1 })
    .select({ testId: 1, _id: 0 });

  if (!lastTestId) {
    return `${product}-${zeroPad(0, 4)}`;
  } else {
    return countPlusOne(lastTestId.testId);
  }
};

const findAvailableTestId = async (testId) => {
  let scheduledTest = await ScheduledTest.findOne({ testId });
  while (scheduledTest) {
    testId = countPlusOne(testId);
    scheduledTest = await ScheduledTest.findOne({ testId });
  }
  return testId;
};

const addTest = async ({ body }, res) => {
  try {
    const {
      name,
      product,
      branch,
      requestor,
      release,
      workflows,
      machine,
      assignedTo,
      instructions,
      priority,
      scheduledTo,
    } = body;

    let lastTestId = await generateTestId(product);
    const testId = await findAvailableTestId(lastTestId);

    const scheduledTest = new ScheduledTest({
      testId,
      name,
      product,
      branch,
      requestor,
      release,
      workflows,
      machine,
      assignedTo,
      instructions,
      notes: "",
      status: "Pending",
      priority,
      scheduledTo,
    });

    await scheduledTest.save();
    res.status(200).send({ message: `Test scheduled successfully` });
  } catch (error) {
    const validationErrors = Object.values(error.errors).map((err) => err.message);
    res.status(409).send({ message: "Validation failed", errors: validationErrors });
  }
};

const getCompletedTests = async (req, res) => {
  const status = ["Fail", "Warning", "Skipped", "Success", "HW Error"];

  const { page = 1, limit = 50 } = req.query;

  try {
    const query = {
      status: { $in: status },
    };

    const count = await ScheduledTest.countDocuments(query);

    const skip = (page - 1) * limit;

    const completedTests = await ScheduledTest.find(query).skip(skip).limit(limit).sort({ scheduledTo: -1 });

    if (!completedTests) {
      return res.status(404).send({ message: "No completed tests found" });
    }

    res.status(200).send({
      tests: completedTests,
      currentPage: page,
      totalTests: count,
    });
  } catch (error) {
    res.status(500).send({ message: "Error retrieving completed tests", error: error.message });
  }
};

const getPendingTests = async (req, res) => {
  const status = ["Pending", "Running"];

  try {
    const query = {
      status: { $in: status },
      deleted: false,
    };

    const pendingTests = await ScheduledTest.find(query).sort({ scheduledTo: -1 });
    if (!pendingTests) {
      return res.status(404).send({ message: "No pending tests found" });
    }
    res.status(200).send(pendingTests);
  } catch (error) {
    res.status(500).send({ message: "Error retrieving pending tests", error: error.message });
  }
};

const getTestByDate = async (req, res) => {
  const { date } = req.params;

  // if !date assign it to today date
  if (!date) {
    date = new Date();
  }
  const beginnigOfDay = new Date(date).setHours(0, 0, 0, 0);
  const endOfDay = new Date(date).setHours(23, 59, 59, 999);

  try {
    const scheduledTests = await ScheduledTest.find({
      $or: [
        { scheduledTo: { $gte: beginnigOfDay, $lt: endOfDay } },
        { completedAt: { $gte: beginnigOfDay, $lt: endOfDay } },
      ],
    }).sort({ scheduledTo: 1 });
    if (!scheduledTests) {
      return res.status(404).send({ message: "No tests found for this date" });
    }
    res.status(200).send(scheduledTests);
  } catch (error) {
    res.status(500).send({ message: "Error retrieving tests", error: error.message });
  }
};

// get scheduledtest data from id
const getTestByTestId = async (req, res) => {
  const { testId } = req.params;

  if (!testId) return res.status(400).send({ message: "No testId provided" });
  try {
    const scheduledTest = await ScheduledTest.findOne({ testId: testId });
    if (!scheduledTest) return res.status(404).send({ message: `Test not found` });
    res.status(200).send(scheduledTest);
  } catch (error) {
    res.status(400).send(error);
  }
};

// toggle delete status and set deletedDate to null if deleted is true
const archiveTest = async (req, res) => {
  const { id } = req.params;
  try {
    const scheduledTest = await ScheduledTest.findById(id);
    if (!scheduledTest) return res.status(404).send({ message: `Test not found` });
    scheduledTest.deleted = !scheduledTest.deleted;
    scheduledTest.deletedAt = new Date();
    await scheduledTest.save();
    res.status(200).send(scheduledTest);
  } catch (error) {
    res.status(400).send(error);
  }
};

const updateTest = async (req, res) => {
  const { testId } = req.params;
  const { field, value } = req.body;

  try {
    const scheduledTest = await ScheduledTest.findById(testId);
    if (!scheduledTest) {
      return res.status(404).send({ message: `Test not found` });
    }

    if (field === "status") {
      if (value !== "Pending" && value !== "Running") {
        scheduledTest.completedAt = new Date();
      }
    }

    scheduledTest[field] = value;
    await scheduledTest.save();

    res.status(200).send({ message: `Test updated ${scheduledTest}` });
  } catch (error) {
    res.status(404).send({ message: `Error loading test data: ${error}` });
  }
};

const advancedFilters = async (req, res) => {
  const { filters } = req.query;
  if (!filters || !Array.isArray(filters) || filters.length === 0) {
    return res.status(200).send({ message: "No filters provided" });
  }

  const query = {
    deleted: false,
  };

  filters.forEach((filter) => {
    const { column, condition, criteria } = filter;

    if (criteria) {
      if (!query[column]) {
        query[column] = {}; // Initialize an empty object for the column
      }

      if (condition === "equals") {
        if (query[column].$in) {
          query[column].$in.push(criteria);
        } else if (query[column].$eq) {
          query[column].$in = [query[column].$eq, criteria];
          delete query[column].$eq;
        } else {
          query[column].$eq = criteria;
        }
      } else if (condition === "contains") {
        if (query[column].$in) {
          query[column].$in.push(new RegExp(criteria, "i"));
        } else if (query[column].$regex) {
          query[column].$in = [query[column].$regex, new RegExp(criteria, "i")];
          delete query[column].$regex;
        } else {
          query[column].$regex = new RegExp(criteria, "i");
        }
      } else if (condition === "startsWith") {
        if (query[column].$in) {
          query[column].$in.push(new RegExp(`^${criteria}`, "i"));
        } else if (query[column].$regex) {
          query[column].$in = [query[column].$regex, new RegExp(`^${criteria}`, "i")];
          delete query[column].$regex;
        } else {
          query[column].$regex = new RegExp(`^${criteria}`, "i");
        }
      } else if (condition === "endsWith") {
        if (query[column].$in) {
          query[column].$in.push(new RegExp(`${criteria}$`, "i"));
        } else if (query[column].$regex) {
          query[column].$in = [query[column].$regex, new RegExp(`${criteria}$`, "i")];
          delete query[column].$regex;
        } else {
          query[column].$regex = new RegExp(`${criteria}$`, "i");
        }
      } else if (condition === "doesNotContain") {
        if (query[column].$in) {
          query[column].$in.push({ $not: new RegExp(criteria, "i") });
        } else if (query[column].$not) {
          query[column].$in = [query[column].$not, { $not: new RegExp(criteria, "i") }];
          delete query[column].$not;
        } else {
          query[column].$not = new RegExp(criteria, "i");
        }
      }
    }
  });

  console.log({ query });

  try {
    const results = await ScheduledTest.find(query).sort({ scheduledTo: -1 });
    res.status(200).send(results);
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
};


module.exports = {
  getTestByTestId,
  getPendingTests,
  getCompletedTests,
  getTestByDate,
  archiveTest,
  updateTest,
  addTest,
  advancedFilters,
};
