const { Preset } = require("../models/presetModel");

// add preset
const addPreset = async (req, res) => {
  const { name, content } = req.body;
  try {
    const newPreset = new Preset({
      name,
      content,
    });
    const preset = await newPreset.save();
    res.status(201).send(preset);
  } catch (error) {
    res.status(400).send(error);
  }
};

// get all presets
const getPresets = async (req, res) => {
  try {
    const presets = await Preset.find();
    res.status(200).send(presets);
  } catch (error) {
    res.status(400).send(error);
  }
};

const deletePreset = async (req, res) => {
  try {
    const preset = await Preset.findByIdAndDelete(req.params.id);
    if (!preset) return res.status(404).send({ message: `Preset not found` });
    res.status(200).send({ message: `Preset deleted` });
  } catch (error) {
    res.status(400).send(error);
  }
};

const updatePreset = async (req, res) => {
  const { id, name, content } = req.body;
  const updatedAt = Date.now();
  try {
    const preset = await Preset.findByIdAndUpdate(id, {
      name,
      content,
      updatedAt,
    });
    if (!preset) return res.status(404).send({ message: `Preset not found` });
    res.status(200).send(preset);
  } catch (error) {
    res.status(400).send(error);
  }
};

const duplicatePreset = async (req, res) => {
  try {
    const preset = await Preset.findById(req.params.id);
    if (!preset) return res.status(404).send({ message: `Preset not found` });
    const newPreset = new Preset({
      name: preset.name + " (copy)",
      content: preset.content,
    });
    const newPresetSaved = await newPreset.save();
    res.status(200).send(newPresetSaved);
  } catch (error) {
    res.status(400).send(error);
  }
};

module.exports = {
  addPreset,
  getPresets,
  deletePreset,
  updatePreset,
  duplicatePreset,
};
