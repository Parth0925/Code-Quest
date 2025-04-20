import React, { useState } from 'react';
import axios from 'axios';

const OTPRequest = ({ onOtpSent }) => {
  const [email, setEmail] = useState('');

  const handleSendOtp = async () => {
    if (!email) {
      alert('Please enter your email');
      return;
    }

    try {
      await axios.post('/send-otp', { email });
      alert('OTP sent successfully! Please check your email.');
      onOtpSent(); // Notify parent component that OTP has been sent
    } catch (error) {
      alert('Error sending OTP');
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
    </div>
  );
};

export default OTPRequest;
