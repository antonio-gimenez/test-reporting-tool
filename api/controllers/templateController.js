const { Template } = require("../models/templateModel");
const Product = require("../models/productModel");

function isMongooseId(input) {
  const mongooseIdRegex = /^[0-9a-fA-F]{24}$/; // Regex pattern for Mongoose ObjectId

  if (typeof input !== "string") {
    return false; // Not a string
  }

  if (mongooseIdRegex.test(input)) {
    return true; // Mongoose ObjectId
  }

  return false; // Regular string
}

const getTemplates = async (req, res) => {
  let { product } = req.params;

  if (!product) {
    res.status(400).json({ error: "Product is required" });
  }

  // check if the product is an id or a name

  const products = await Product.find({});

  if (!isMongooseId(product)) {
    let productName = products.find((p) => p.name === product);
    product = productName;
  }

  try {
    const templates = await Template.find({ product });
    res.status(200).json(templates);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const addTemplate = async (req, res) => {
  const { name, workflows, product } = req.body;
  try {
    const template = await Template.create({ name, workflows, product });
    res.status(201).json(template);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const deleteTemplate = async (req, res) => {
  const { id } = req.params;
  try {
    const template = await Template.findByIdAndDelete(id);
    res.status(200).json(template);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const duplicateTemplate = async (req, res) => {
  const { id } = req.params;
  try {
    const template = await Template.findById(id);
    const newTemplate = await Template.create({
      name: template.name + " (copy)",
      workflows: template.workflows,
      product: template.product,
    });
    res.status(200).json(newTemplate);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const updateTemplate = async (req, res) => {
  const { id } = req.params;
  const { name, workflows, product } = req.body;

  const updatedAt = Date.now();
  try {
    const template = await Template.findByIdAndUpdate(id, { name, workflows, product, updatedAt }, { upsert: true });
    if (!template) {
      res.status(404).json({ error: "Template not found" });
    }
    res.status(200).json({ message: "Template updated" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  getTemplates,
  addTemplate,
  deleteTemplate,
  duplicateTemplate,
  updateTemplate,
};
