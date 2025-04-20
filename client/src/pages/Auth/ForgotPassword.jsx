// src/pages/Auth/ForgotPassword.jsx
import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
//import { sendResetRequest } from '../../action/auth'; // We'll define this in the actions
import './Auth.css';
import axios from 'axios';

const ForgotPassword = () => {
  const [emailOrPhone, setEmailOrPhone] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  //const dispatch = useDispatch();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!emailOrPhone) {
      setError('Please enter your email or phone number');
      return;
    }

    try {
        // Send POST request to the backend
        const response = await axios.post('http://localhost:5001/user/forgot-password', {
          emailOrPhone,
        });
  
        setMessage('Reset link has been sent. Please check your email or phone.');
      } catch (err) {
        setError(err.response?.data || 'An error occurred');
      }
    };

//     dispatch(sendResetRequest(emailOrPhone))
//       .then((response) => {
//         setMessage('Reset link has been sent. Please check your email or phone.');
//       })
//       .catch((error) => {
//         setError(error.message);
//       });
//   };

  return (
    <section className="auth-section">
      <div className="auth-container">
        <h2>Forgot Password</h2>
        <form onSubmit={handleSubmit}>
          <label htmlFor="emailOrPhone">
            <h4>Email or Phone</h4>
            <input
              type="text"
              id="emailOrPhone"
              value={emailOrPhone}
              onChange={(e) => setEmailOrPhone(e.target.value)}
            />
          </label>
          {error && <p style={{ color: 'red' }}>{error}</p>}
          {message && <p style={{ color: 'green' }}>{message}</p>}
          <button type="submit" className="auth-btn">Submit</button>
        </form>
      </div>
    </section>
  );
};

export default ForgotPassword;
