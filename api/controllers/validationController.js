const { ScheduledTest } = require("../models/testModel");

const getValidatedReleases = async (req, res) => {
  const days = Number(req.params.days) || 7;
  if (isNaN(days)) {
    return res.status(400).send({ message: "Invalid value for days parameter" });
  }

  const dateRange = { $gte: new Date(Date.now() - days * 24 * 60 * 60 * 1000), $lte: new Date(Date.now()) };
  if (!dateRange) {
    return res.status(400).send({ message: "Invalid value for days parameter" });
  }
  try {
    const lastSuccess = await ScheduledTest.aggregate([
      {
        $match: {
          status: { $in: ["Success", "Warning"] },
          scheduledTo: dateRange,
          deleted: false,
        },
      },
      {
        $group: {
          _id: "$testId",
          branch: { $last: "$branch" },
          release: { $last: "$release" },
          product: { $last: "$product" },
          name: { $last: "$name" },
          testId: { $last: "$testId" },
          status: { $last: "$status" },
          completedAt: { $last: "$completedAt" },
        },
      },
      {
        $sort: { completedAt: -1 },
      },
    ]);

    res.status(200).send(lastSuccess);
  } catch (err) {
    res.status(409).send({ message: `Error retrieving data: ${err}` });
  }
};

module.exports = {
  getValidatedReleases,
};
