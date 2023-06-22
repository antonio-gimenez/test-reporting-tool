const User = require("../models/userModel");

const addUser = async (req, res) => {
  const { name } = req.body;
  try {
    const newUser = new User({
      name,
    });
    const user = await newUser.save();
    res.status(201).send(user);
  } catch (error) {
    res.status(400).send(error);
  }
};

const getUsers = async (req, res) => {
  try {
    const users = await User.find();
    res.status(200).send(users);
  } catch (error) {
    res.status(400).send(error);
  }
};

// delete user
const deleteUser = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).send({ message: `User not found` });
    res.status(200).send({ message: `User deleted` });
  } catch (error) {
    res.status(400).send(error);
  }
};

const updateUser = async (req, res) => {
  try {
    const { id, name, email, active, APIKey } = req.body;
    // updateAt
    const updatedAt = Date.now();
    // Find the branch by ID and update its name
    const user = await User.findByIdAndUpdate(id, { name, APIKey, active, email, updatedAt }, { new: true });
    if (!user) {
      return res.status(404).send({ message: "User not found" });
    }
    res.send(user);
  } catch (error) {
    res.status(400).send(error);
  }
};

module.exports = { addUser, getUsers, deleteUser, updateUser };
