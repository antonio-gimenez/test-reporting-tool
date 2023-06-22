const Product = require("../models/productModel");
const { DefaultTest } = require("../models/testModel");

const getProducts = async (req, res) => {
  try {
    const products = await Product.find();
    res.status(200).send(products);
  } catch (error) {
    res.status(400).send(error);
  }
};

const getActiveProducts = async (req, res) => {
  try {
    const products = await Product.find({ active: true });
    res.status(200).send(products);
  } catch (error) {
    res.status(400).send(error);
  }
};

// add product
const addProduct = async (req, res) => {
  const { name } = req.body;
  try {
    const newProduct = new Product({
      name: name,
    });
    const product = await newProduct.save();
    res.status(201).send(product);
  } catch (error) {
    res.status(400).send(error);
  }
};

// delete product
const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);

    await DefaultTest.deleteMany({ product: product._id });

    if (!product) return res.status(404).send({ message: `Product not found` });
    res.status(200).send({ message: `Product deleted` });
  } catch (error) {
    res.status(400).send(error);
  }
};

const updateProduct = async (req, res) => {
  try {
    const { id, name, active } = req.body;
    const updatedAt = Date.now();
    const product = await Product.findByIdAndUpdate(id, { name, active, updatedAt }, { new: true });
    if (!product) {
      return res.status(404).send({ message: "Product not found" });
    }

    res.send(product);
  } catch (error) {
    res.status(400).send(error);
  }
};

module.exports = { getProducts, addProduct, deleteProduct, updateProduct };
