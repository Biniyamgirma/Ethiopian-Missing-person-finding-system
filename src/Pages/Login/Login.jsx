import React, { useState } from 'react';
import './Login.css';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios'; // Import axios
import { useAuth } from '../../contexts/AuthContext'; // Import useAuth
import LoginToast from './LoginToast'; // Import the updated LoginToast component


const Login = () => {
  const [policeOfficerId, setPoliceOfficerId] = useState('');
  const [password, setPassword] = useState('');
  // const [error, setError] = useState(''); // Old error state
  const [toast, setToast] = useState({
    show: false,
    message: '',
    type: 'error', // Default type for login errors
    title: '',
  });
  const navigate = useNavigate();
  const location = useLocation();
  const { login: authLogin } = useAuth(); // Get the login function from AuthContext

  // Configure axios base URL (optional but recommended)
  axios.defaults.baseURL = 'http://localhost:3004';

  const showToast = (message, type = 'error', title = '') => {
    setToast({ show: true, message, type, title: title || (type === 'error' ? 'Login Failed' : '') });
  };

  const hideToast = () => {
    setToast((prev) => ({ ...prev, show: false, message: '' }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    hideToast(); // Clear previous toasts
    try {
        const response = await axios.post('/api/police/login', {
            policeOfficerId,
            password
        }, {
            headers: {
                'Content-Type': 'application/json'
            }
        });
        
        const { data } = response;

        if (data.success) {
          // Update authentication state using AuthContext
          // This function should handle setting currentUser and storing token/officer info in localStorage
          authLogin(data.officer, data.token); 

          console.log("Login successful. Officer:", data.officer, "Token:", data.token);

          // Redirect to the page the user was trying to access, or to home page
          const from = location.state?.from?.pathname || "/";
          navigate(from, { replace: true });
        } else {
          showToast(data.message || 'Login failed');
        }
    } catch (err) {
        if (err.response) {
            showToast(err.response.data.message || 'Login failed due to server error');
        } else if (err.request) {
            showToast('Network error - please try again');
        } else {
            showToast('An unexpected error occurred');
        }
    }
  };

  return (
    <div className='login'>
      {toast.show && (
        <LoginToast
          type={toast.type}
          title={toast.title}
          message={toast.message}
          onClose={hideToast}
        />
      )}

      <div className="main-container1">
        {/* Rest of your JSX remains exactly the same */}
        <div className="left-image">
          <img src="./Image/signIn.jpg" alt="" />
        </div>

        <div className="login-section1">
          <div className="login-container">
            <div className="icons-for-header">
              <img src="./Image/fedral.png" alt="fedral police picture or logo" />
              <img src="./Image/images.png" alt="debrebrhan university logo" />
            </div>
            <h4 className="welcome-message1">WELCOME TO AMHARA MISSING PERSON FINDING SYSTEM</h4>
            <div className="text-for-header">
              <h2>Login to Your Account</h2>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="username">Enter Your ID</label>
                <input 
                  type="text"
                  id="username" 
                  placeholder="PO00001"
                  value={policeOfficerId} 
                  onChange={(e) => setPoliceOfficerId(e.target.value)}
                  required 
                />
              </div>

              <div className="form-group">
                <label htmlFor="password">Password</label>
                <input
                  type="password"
                  id="password" 
                  value={password}
                  placeholder="amin123"
                  onChange={(e) => setPassword(e.target.value)}
                  required 
                />
              </div>

              <div className="button-group" style={{ display: 'flex', justifyContent: 'center' }}>
                <button type="submit">LOGIN</button>
              </div>
            </form>
            <div className="text-for-header1"><img src="./Image/ethiopia.png" alt="" /></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;