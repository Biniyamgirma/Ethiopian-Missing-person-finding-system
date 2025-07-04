import React, { useState } from "react";
import './Login.css';
const Login = () => {
    return (
    <div className='login'>

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
            <form >
              <div className="form-group">
                <label htmlFor="username">Enter Your ID</label>
                <input 
                  type="text"
                  id="username" 
                  placeholder="PO00001"
                  required 
                />
              </div>

              <div className="form-group">
                <label htmlFor="password">Password</label>
                <input
                  type="password"
                  id="password" 
                  placeholder="amin123"
                  required 
                />
              </div>

              <div className="button-group" style={{ display: 'flex', justifyContent: 'center' }}>
                <button type="submit">LOGIN</button>
              </div>
            </form>
            <div className="text-for-header1"><img src="./image/ethiopia.png" alt="" /></div>
          </div>
        </div>
      </div>
    </div>
  );

}

export default Login;