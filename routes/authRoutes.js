import express from 'express';

import { forgotPasswordController, getAllOrdersController, getOrdersController, loginController, orderStatusController, registerController, testController, updateProfileController } from '../controllers/authController.js';
import { isAdmin, requireSignIn } from '../middlewares/authMiddlewares.js';

const router = express.Router();

//register user
router.post('/register', registerController);

//login user
router.post('/login', loginController);

//forgot password
router.post('/forgot-password', forgotPasswordController);

//test routes
router.get('/test', requireSignIn, isAdmin, testController);

//protected User route auth
router.get('/user-auth', requireSignIn, (req, res) => {
  res.status(200).send({ ok: true });
});

//protected Admin route auth
router.get('/admin-auth', requireSignIn, isAdmin, (req, res) => {
  res.status(200).send({ ok: true });
});

//update profile
router.put('/update-profile', requireSignIn, updateProfileController);

//orders
router.get('/orders', requireSignIn, getOrdersController);

//orders
router.get('/all-orders', requireSignIn, isAdmin, getAllOrdersController);
//orders status
router.put('/order-status/:orderId', requireSignIn, isAdmin, orderStatusController);

export default router;
