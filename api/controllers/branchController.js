const { Branch } = require("../models/branchModel");
const mongoose = require("mongoose");

// add branch
const addBranch = async (req, res) => {
  const { name } = req.body;
  try {
    const newBranch = new Branch({
      name,
    });
    const branch = await newBranch.save();
    res.status(201).send(branch);
  } catch (error) {
    res.status(400).send(error);
  }
};
// get all branches
const getBranches = async (req, res) => {
  try {
    const branches = await Branch.find();
    res.status(200).send(branches);
  } catch (error) {
    res.status(400).send(error);
  }
};

// delete branch
const deleteBranch = async (req, res) => {
  try {
    const branch = await Branch.findByIdAndDelete(req.params.id);
    if (!branch) return res.status(404).send({ message: `Branch not found` });
    res.status(200).send({ message: `Branch deleted` });
  } catch (error) {
    res.status(400).send(error);
  }
};

const updateBranch = async (req, res) => {
  try {
    const { id, name, active } = req.body;
    const updatedAt = Date.now();
    // Find the branch by ID and update its name
    const branch = await Branch.findByIdAndUpdate(id, { name, active, updatedAt }, { new: true });
    if (!branch) {
      return res.status(404).send({ message: "Branch not found" });
    }

    res.send(branch);
  } catch (error) {
    res.status(400).send(error);
  }
};

module.exports = {
  addBranch,
  getBranches,
  deleteBranch,
  updateBranch,
};
