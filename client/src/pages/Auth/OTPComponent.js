import React, { useState } from 'react';
import axios from 'axios';

const OTPComponent = ({ setOtpVerified }) => {
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [message, setMessage] = useState('');
  const [otpSent, setOtpSent] = useState(false);

  const handleSendOtp = async () => {
    try {
      const response = await axios.post('http://localhost:5001/send-otp', { email });
      setMessage(response.data);
      setOtpSent(true);
    } catch (error) {
      setMessage('Error sending OTP');
      console.error('Error sending OTP:', error);
    }
  };

  const handleVerifyOtp = async () => {
    try {
      const response = await axios.post('http://localhost:5001/verify-otp', { email, otp });
      setMessage(response.data);
      setOtpVerified(true);
    } catch (error) {
      setMessage('Invalid OTP');
    }
  };

  return (
    <div>
      <h2>Enter your Email to Receive OTP</h2>
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Enter your email"
      />
      <button onClick={handleSendOtp}>Send OTP</button>

      {otpSent && (
        <div>
          <h3>Enter OTP:</h3>
          <input
            type="text"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            placeholder="Enter OTP"
          />
          <button onClick={handleVerifyOtp}>Verify OTP</button>
        </div>
      )}

      {message && <p>{message}</p>}
    </div>
  );
};

export default OTPComponent;
