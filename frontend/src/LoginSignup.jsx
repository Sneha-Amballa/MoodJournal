import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import './Login_and_signup_css.css';

function LoginSignup() {
  const [isLogin, setIsLogin] = useState(true);
  const navigate = useNavigate();

  const nameRef = useRef();
  const emailRef = useRef();
  const passwordRef = useRef();
  const confirmPasswordRef = useRef();

  const handleSubmit = async (e) => {
    e.preventDefault();

    const email = emailRef.current.value;
    const password = passwordRef.current.value;

    if (!isLogin && password !== confirmPasswordRef.current.value) {
      alert("Passwords do not match");
      return;
    }

    const url = isLogin
      ? 'https://moodjournal-backend-w00a.onrender.com/login'
      : 'https://moodjournal-backend-w00a.onrender.com/signup';

    const body = isLogin
      ? { email, password }
      : {
          name: nameRef.current.value,
          email,
          password,
        };

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('userId', data.userId);
        navigate('/journal');
      } else {
        alert(data.error || 'Authentication failed');
      }
    } catch (err) {
      console.error('Error:', err);
      alert('Server error');
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-box">
        <h2 className="gradient-text">
          {isLogin ? 'Welcome Back' : 'Create Your Account'}
        </h2>
        <p className="subtitle">
          {isLogin
            ? 'Log in to track your mood and well-being.'
            : 'Sign up to start your MoodJournal journey.'}
        </p>

        <form className="auth-form" onSubmit={handleSubmit}>
          {!isLogin && (
            <input type="text" placeholder="Full Name" ref={nameRef} required />
          )}
          <input type="email" placeholder="Email Address" ref={emailRef} required />
          <input type="password" placeholder="Password" ref={passwordRef} required />
          {!isLogin && (
            <input
              type="password"
              placeholder="Confirm Password"
              ref={confirmPasswordRef}
              required
            />
          )}

          <button type="submit" className="button get-started">
            {isLogin ? 'Sign In' : 'Create Account'}
          </button>
        </form>

        <p className="toggle-auth">
          {isLogin ? (
            <>
              Don’t have an account?{' '}
              <button className="link-btn" onClick={() => setIsLogin(false)}>
                Sign Up
              </button>
            </>
          ) : (
            <>
              Already have an account?{' '}
              <button className="link-btn" onClick={() => setIsLogin(true)}>
                Sign In
              </button>
            </>
          )}
        </p>

        <p className="back-link">
          <a href="/">← Back to Home</a>
        </p>
      </div>
    </div>
  );
}

export default LoginSignup;