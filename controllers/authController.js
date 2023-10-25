import { comparePassword, hashPassword } from '../helpers/authHelpers.js';
import orderModel from '../models/orderModel.js';
import userModel from '../models/userModel.js';
import JWT from 'jsonwebtoken';

//Post Register
export const registerController = async (req, res) => {
  try {
    const { username, email, password, phone, adress, answer } = req.body;

    //validations
    if (!username) {
      return res.send({ message: 'Username is required' });
    }
    if (!email) {
      return res.send({ message: 'Email is required' });
    }
    if (!password) {
      return res.send({ message: 'Password is required' });
    }
    if (!phone) {
      return res.send({ message: 'Phone is required' });
    }
    if (!adress) {
      return res.send({ message: 'Adress is required' });
    }
    if (!answer) {
      return res.send({ message: 'Answer is required' });
    }

    //check user
    const existingUser = await userModel.findOne({ email });

    //existing user
    if (existingUser) {
      return res.status(200).send({
        success: false,
        message: 'Already register please login',
      });
    }

    //register user
    const hashedPassword = await hashPassword(password);

    //save
    const user = await new userModel({
      username,
      email,
      phone,
      adress,
      password: hashedPassword,
      answer,
    }).save();

    res.status(201).send({
      success: true,
      message: 'User Register Successfully',
      user,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: 'Error in register user',
      error,
    });
  }
};

// Post Login
export const loginController = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    //validations
    if (!email || !password) {
      return res.status(404).send({
        success: false,
        message: 'Invalid email or password',
      });
    }

    //check user
    const user = await userModel.findOne({ email });
    if (!user) {
      return res.status(404).send({
        success: false,
        message: 'Email is not registered',
      });
    }

    const match = await comparePassword(password, user.password);
    if (!match) {
      return res.status(200).send({
        success: false,
        message: 'Invalid password',
      });
    }

    //token
    const token = await JWT.sign({ _id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.status(200).send({
      success: true,
      message: 'Login successfully',
      user: {
        username: user.username,
        email: user.email,
        phone: user.phone,
        adress: user.adress,
        answer: user.answer,
        role: user.role,
      },
      token,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: 'Error in login',
      error,
    });
  }
};

//forgot password controller
export const forgotPasswordController = async (req, res) => {
  try {
    const { email, answer, newPassword } = req.body;

    //required
    if (!email) {
      res.status(400).send({
        message: 'Email is required',
      });
    }
    if (!answer) {
      res.status(400).send({
        message: 'Answer is required',
      });
    }
    if (!newPassword) {
      res.status(400).send({
        message: 'New Password is required',
      });
    }

    //check user
    const user = await userModel.findOne({ email, answer });

    //validations
    if (!user) {
      return res.status(404).send({
        success: false,
        message: 'Something went wrong',
      });
    }

    const hashed = await hashPassword(newPassword);
    await userModel.findByIdAndUpdate(user._id, { password: hashed });
    res.status(200).send({
      success: true,
      message: 'Password reset successfully',
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: 'Something went wrong',
      error,
    });
  }
};

//test controller
export const testController = async (req, res) => {
  res.send('Protected Routes');
};

//update profile
export const updateProfileController = async (req, res) => {
  try {
    const { username, email, password, phone, adress, answer } = req.body;
    const user = await userModel.findById(req.user._id);

    //password
    if (password && password.length < 6) {
      return res.json({
        error: 'Password is required and 6 characater long',
      });
    }

    const hashedPassword = password ? await hashPassword(password) : undefined;
    const updateUser = await userModel.findByIdAndUpdate(
      req.user._id,
      {
        username: username || user.username,
        password: hashedPassword || user.password,
        email: email || user.email,
        phone: phone || user.phone,
        adress: adress || user.adress,
        answer: answer || user.answer,
      },
      { new: true }
    );
    res.status(200).send({
      success: true,
      message: 'Profile updated successfully',
      updateUser,
    });
  } catch (error) {
    console.log(error);
    res.status(400).send({
      success: false,
      message: 'Error while update profile',
      error,
    });
  }
};

//orders
export const getOrdersController = async (req, res) => {
  try {
    const orders = await orderModel.find({ buyer: req.user._id }).populate('products', '-image').populate('buyer', 'username');
    res.json(orders);
  } catch (error) {
    console.log(error);
    res.status(400).send({
      success: false,
      message: 'Error while getting orders',
      error,
    });
  }
};

//all orders
export const getAllOrdersController = async (req, res) => {
  try {
    const orders = await orderModel.find({}).populate('products', '-image').populate('buyer', 'username').sort({ createdAt: '-1' });
    res.json(orders);
  } catch (error) {
    console.log(error);
    res.status(400).send({
      success: false,
      message: 'Error while getting orders',
      error,
    });
  }
};

//order status
export const orderStatusController = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { status } = req.body;
    const orders = await orderModel.findByIdAndUpdate(
      orderId,
      {
        status,
      },
      { new: true }
    );
    res.json(orders);
  } catch (error) {
    console.log(error);
    res.status(400).send({
      success: false,
      message: 'Error while updating orders',
      error,
    });
  }
};
