import express from 'express';
import { isAdmin, requireSignIn } from '../middlewares/authMiddlewares.js';
import {
  braintreePaymentController,
  braintreeTokenController,
  createProductController,
  deleteProductController,
  getAllProductController,
  getProductImageController,
  getSingleProduct,
  productCategoryController,
  productCountController,
  productFilterController,
  productListController,
  relatedProductController,
  searchProductController,
  updateProductController,
} from '../controllers/productController.js';
import formidable from 'express-formidable';

const router = express.Router();

//create
router.post('/create', requireSignIn, isAdmin, formidable(), createProductController);
//get update product
router.put('/update/:pid', requireSignIn, isAdmin, formidable(), updateProductController);
//get all product
router.get('/get', getAllProductController);
//get single product
router.get('/get/:slug', getSingleProduct);
//get single product
router.get('/image/:pid', getProductImageController);
//get delete product
router.delete('/delete/:pid', deleteProductController);
//get delete product
router.get('/p-count/', productCountController);
//get delete product
router.get('/p-list/:page', productListController);
//get delete product
router.get('/search/:keyword', searchProductController);
//get delete product
router.get('/related-p/:pid/:cid', relatedProductController);
//get delete product
router.get('/p-category/:slug', productCategoryController);
//get filter product
router.post('/product-filter', productFilterController);

//payment routes
//token
router.get('/braintree/token', braintreeTokenController);

//payments
router.post('/braintree/payment', requireSignIn, braintreePaymentController);

export default router;
