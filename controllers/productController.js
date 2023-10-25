import slugify from 'slugify';
import productModel from '../models/productModel.js';
import categoryModel from '../models/categoryModel.js';
import orderModel from '../models/orderModel.js';
import braintree from 'braintree';
import fs from 'fs';

import dotenv from 'dotenv';

dotenv.config();

//payment gateway
var gateway = new braintree.BraintreeGateway({
  environment: braintree.Environment.Sandbox,
  merchantId: process.env.BRAINTREE_MERCHENT_ID,
  publicKey: process.env.BRAINTREE_PUBLIC_KEY,
  privateKey: process.env.BRAINTREE_PRIVATE_KEY,
});

//create
export const createProductController = async (req, res) => {
  try {
    const { title, slug, desc, price, category, quantity, shipping } = req.fields;
    const { image } = req.files;

    //validations
    switch (true) {
      case !title:
        return res.status(500).send({
          error: 'title is required',
        });
      case !desc:
        return res.status(500).send({
          error: 'description is required',
        });
      case !price:
        return res.status(500).send({
          error: 'price is required',
        });
      case !category:
        return res.status(500).send({
          error: 'category is required',
        });
      case !quantity:
        return res.status(500).send({
          error: 'quantity is required',
        });
      case !image && image.size > 1000000:
        return res.status(500).send({
          error: 'image is required and should be less then 1mb',
        });
    }
    const products = new productModel({ ...req.fields, slug: slugify(title) });
    if (image) {
      products.image.data = fs.readFileSync(image.path);
      products.image.contentType = image.type;
    }
    await products.save();
    res.status(200).send({
      success: true,
      message: 'Product created successfully',
      products,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      error,
      message: 'Error in creating product',
    });
  }
};

//get all product
export const getAllProductController = async (req, res) => {
  try {
    const products = await productModel.find({}).select('-image').limit(8).sort({ createdAt: -1 });
    res.status(200).send({
      success: true,
      counTotal: products.length,
      message: 'All product',
      products,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      error,
      message: 'Error in get all product',
    });
  }
};

//get single product
export const getSingleProduct = async (req, res) => {
  try {
    const products = await productModel
      .findOne({
        slug: req.params.slug,
      })
      .select('-image')
      .populate('category');
    res.status(200).send({
      success: true,
      message: 'Single product fetched',
      products,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      error,
      message: 'Error in get single product',
    });
  }
};

//get photo
export const getProductImageController = async (req, res) => {
  try {
    const product = await productModel.findById(req.params.pid).select('image');
    if (product.image.data) {
      res.set('Content-type', product.image.contentType);
      return res.status(200).send(product.image.data);
    }
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: 'Error while getting image',
      error,
    });
  }
};

//delete product
export const deleteProductController = async (req, res) => {
  try {
    await productModel.findByIdAndDelete(req.params.pid).select('-image');
    res.status(200).send({
      success: true,
      message: 'Product deleted successfully',
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: 'Error while delete product',
      error,
    });
  }
};

//update product
export const updateProductController = async (req, res) => {
  try {
    const { title, slug, desc, price, category, quantity, shipping } = req.fields;
    const { image } = req.files;

    //validations
    switch (true) {
      case !title:
        return res.status(500).send({
          error: 'title is required',
        });
      case !desc:
        return res.status(500).send({
          error: 'description is required',
        });
      case !price:
        return res.status(500).send({
          error: 'price is required',
        });
      case !category:
        return res.status(500).send({
          error: 'category is required',
        });
      case !quantity:
        return res.status(500).send({
          error: 'quantity is required',
        });
      case image && image.size > 1000000:
        return res.status(500).send({
          error: 'image is required and should be less then 1mb',
        });
    }
    const products = await productModel.findByIdAndUpdate(req.params.pid, { ...req.fields, slug: slugify(title) }, { new: true });
    if (image) {
      products.image.data = fs.readFileSync(image.path);
      products.image.contentType = image.type;
    }
    await products.save();
    res.status(200).send({
      success: true,
      message: 'Product updated successfully',
      products,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: 'Error while update product',
      error,
    });
  }
};

//product count
export const productCountController = async (req, res) => {
  try {
    const total = await productModel.find({}).estimatedDocumentCount();
    res.status(200).send({
      success: true,
      total,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: 'Error in product count',
      error,
    });
  }
};

//product per page
export const productListController = async (req, res) => {
  try {
    const perPage = 3;
    const page = req.params.page ? req.params.page : 1;
    const products = await productModel
      .find({})
      .select('-image')
      .skip((page - 1) * perPage)
      .limit(perPage)
      .sort({ createdAt: -1 });
    res.status(200).send({
      success: true,
      products,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: 'Error in per page ctrl',
      error,
    });
  }
};

//filter product by price
export const productFilterController = async (req, res) => {
  try {
    const { checked, radio } = req.body;
    let args = {};
    if (checked.length > 0) args.category = checked;
    if (radio.length) args.price = { $gte: radio[0], $lte: radio[1] };
    const products = await productModel.find(args);
    res.status(200).send({
      success: true,
      products,
    });
  } catch (error) {
    console.log(error);
    res.status(400).send({
      success: false,
      message: 'Error while filtering product',
      error,
    });
  }
};

//search product
export const searchProductController = async (req, res) => {
  try {
    const { keyword } = req.params;
    const result = await productModel
      .find({
        $or: [{ title: { $regex: keyword, $options: 'i' } }, { desc: { $regex: keyword, $options: 'i' } }],
      })
      .select('-image');
    res.json(result);
  } catch (error) {
    console.log(error);
    res.status(400).send({
      success: false,
      message: 'Error in search product api',
      error,
    });
  }
};

//similiar products
export const relatedProductController = async (req, res) => {
  try {
    const { pid, cid } = req.params;
    const products = await productModel
      .find({
        category: cid,
        _id: { $ne: pid },
      })
      .select('-image')
      .limit(8)
      .populate('category');
    res.status(200).send({
      success: false,
      products,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: 'Error while getting image',
      error,
    });
  }
};

//get product by category
export const productCategoryController = async (req, res) => {
  try {
    const category = await categoryModel.findOne({
      slug: req.params.slug,
    });

    const products = await productModel.find({ category }).populate('category');
    res.status(200).send({
      success: true,
      category,
      products,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: 'Error while product category',
      error,
    });
  }
};

//payment gateway api
export const braintreeTokenController = async (req, res) => {
  try {
    gateway.clientToken.generate({}, function (err, response) {
      if (err) {
        res.status(500).send(err);
      } else {
        res.send(response);
      }
    });
  } catch (error) {
    console.log(error);
  }
};

//payment
export const braintreePaymentController = async (req, res) => {
  try {
    const { cart, nonce } = req.body;
    let total = 0;
    cart.map((i) => {
      total += i.price;
    });
    let newTransaction = gateway.transaction.sale(
      {
        amount: total,
        paymentMethodNonce: nonce,
        options: {
          submitForSettlement: true,
        },
      },
      function (error, result) {
        if (result) {
          const order = new orderModel({
            products: cart,
            payment: result,
            buyer: req.user._id,
          }).save();
          res.json({ ok: true });
        } else {
          res.status(500).send(error);
        }
      }
    );
  } catch (error) {
    console.log(error);
  }
};
