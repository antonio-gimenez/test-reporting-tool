const Mail = require("../models/mailModel");

const addMail = async (req, res) => {
  const { name, recipientType = 'cc' } = req.body;
  try {
    const newMail = new Mail({
      name,
      recipientType,
    });
    const mail = await newMail.save();
    res.status(201).send(mail);
  } catch (error) {
    res.status(400).send(error);
  }
};

const getMails = async (req, res) => {
  try {
    const mails = await Mail.find();
    res.status(200).send(mails);
  } catch (error) {
    res.status(400).send(error);
  }
};

const deleteMail = async (req, res) => {
  try {
    const mail = await Mail.findByIdAndDelete(req.params.id);
    if (!mail) return res.status(404).send({ message: `Mail not found` });
    res.status(200).send({ message: `Mail deleted` });
  } catch (error) {
    res.status(400).send(error);
  }
};

const updateMail = async (req, res) => {
  const { id, name, recipientType } = req.body;
  try {
    const mail = await Mail.findById(id);
    if (!mail) {
      return res.status(404).send({ message: `Mail not found` });
    }
    // Create a new object with only the properties that have changed
    const updatedMail = {
      name: name || mail.name,
      updatedAt: Date.now(),
      recipientType: recipientType || mail.recipientType,
    };

    const result = await Mail.findByIdAndUpdate(id, updatedMail, { new: true });
    if (!result) {
      return res.status(404).send({ message: `Mail not found` });
    }
    res.status(200).send(result);
  } catch (error) {
    res.status(400).send(error);
  }
};

module.exports = { addMail, getMails, deleteMail, updateMail };
