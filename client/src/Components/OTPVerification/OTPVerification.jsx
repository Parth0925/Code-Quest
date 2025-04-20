import React, { useState } from 'react';
import axios from 'axios';

const OTPVerification = ({ onVerified }) => {
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');

  const handleSendOtp = async () => {
    try {
      await axios.post('/verify-otp', { email, otp });
      onVerified();
    } catch (error) {
      alert('Invalid OTP');
    }
  };

  return (
    <div>
      <input
        type="email"
        placeholder="Enter your email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <button onClick={handleSendOtp}>Send OTP</button>

      <input
        type="text"
        placeholder="Enter OTP"
        value={otp}
        onChange={(e) => setOtp(e.target.value)}
      />
      <button onClick={handleSendOtp}>Verify OTP</button>
    </div>
  );
};

export default OTPVerification;
