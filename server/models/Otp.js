import mongoose from 'mongoose';

const otpSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
  },
  otp: {
    type: Number,
    required: true,
  },
  timestamp: {
    type: Date,
    default: Date.now,  // Record the time when the OTP is generated
  },
});

const Otp = mongoose.model('Otp', otpSchema);

export default Otp;
