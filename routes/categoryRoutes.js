import express from 'express';
import { isAdmin, requireSignIn } from '../middlewares/authMiddlewares.js';
import { createCategoryController, getCategoryController, getSingleCategoryController } from '../controllers/categoryController.js';

const router = express.Router();

//add
router.post('/create', requireSignIn, isAdmin, createCategoryController);
//get all
router.get('/get-category', getCategoryController);
//get single
router.get('/single-category/:slug', getSingleCategoryController);

export default router;
