// server/controllers/userController.js
import User from '../models/auth.js';
import Otp from '../models/Otp.js'
import nodemailer from 'nodemailer';
import moment from 'moment'; // For date comparison
import dotenv from 'dotenv';
import crypto from 'crypto'

dotenv.config();

const emailUser = process.env.EMAIL;
const emailPass = process.env.EMAIL_PASSWORD;

export const requestPasswordReset = async (req, res) => {
  const { emailOrPhone } = req.body;

  if (!emailOrPhone) {
    return res.status(400).json({ message: 'Email or Phone is required' });
  }

  // Check if email or phone exists in the database
  const user = await User.findOne({
    $or: [{ email: emailOrPhone }, { phone: emailOrPhone }],
  });

  if (!user) {
    return res.status(404).send('User not found');
  }

  // Check if user has requested a reset within the last 24 hours
  const lastRequest = await Otp.findOne({
    userId: user._id,
    createdAt: { $gte: moment().subtract(1, 'days').toDate() },
  });

  if (lastRequest) {
    return res.status(400).send('You can only request a reset once per day.');
  }

  // Generate OTP or reset token
  const resetToken = Math.random().toString(36).substring(2, 15);

  // Save the OTP to database
  await Otp.create({ userId: user._id, token: resetToken });

  // Send an email (or SMS) with the reset token
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: emailUser,
      pass: emailPass,
    },
  });

  const mailOptions = {
    from: emailUser,
    to: user.email,
    subject: 'Password Reset Request',
    text: `Click the following link to reset your password: ${resetToken}`,
  };

  transporter.sendMail(mailOptions, (err, info) => {
    if (err) {
      return res.status(500).send('Error sending email');
    }
    res.send('Reset link sent');
  });
};
