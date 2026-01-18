import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import './LoginSignup.css';

const QUOTES = [
  "The only way to do great work is to love what you do.",
  "Innovation distinguishes between a leader and a follower.",
  "Stay hungry. Stay foolish.",
  "The future belongs to those who believe in the beauty of their dreams.",
  "It is during our darkest moments that we must focus to see the light.",
  "The only impossible journey is the one you never begin.",
  "In the middle of difficulty lies opportunity.",
  "Don't watch the clock; do what it does. Keep going.",
];

export default function LoginSignup() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [currentQuoteIndex, setCurrentQuoteIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentQuoteIndex((prev) => (prev + 1) % QUOTES.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Validation
      if (!isLogin && password !== confirmPassword) {
        setError('Passwords do not match');
        setLoading(false);
        return;
      }

      if (!username || !password) {
        setError('Username and password are required');
        setLoading(false);
        return;
      }

      const endpoint = isLogin ? '/api/auth/login' : '/api/auth/register';
      const body = isLogin
        ? { username, password }
        : { username, email, password };

      const response = await fetch(`http://127.0.0.1:5000${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Authentication failed');
      }

      // Save token and user info
      localStorage.setItem('token', data.access_token);
      localStorage.setItem('user', JSON.stringify({
        id: data.user_id,
        username: data.username || username,
        role: data.role || 'user'
      }));

      // Redirect to dashboard
      setTimeout(() => {
        window.location.href = '/dashboard';
      }, 500);
    } catch (err) {
      console.error('Auth error:', err);
      setError(err.message || 'An error occurred');
      setLoading(false);
    }
  };

  return (
    <div className="login-signup-container">
      {/* Left Side - Quotes */}
      <motion.div
        className="quotes-section"
        initial={{ opacity: 0, x: -50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.8 }}
      >
        <div className="quotes-container">
          <motion.div
            key={currentQuoteIndex}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5 }}
            className="quote"
          >
            <p className="quote-text">"{QUOTES[currentQuoteIndex]}"</p>
          </motion.div>
          <div className="quote-dots">
            {QUOTES.map((_, idx) => (
              <motion.div
                key={idx}
                className={`dot ${idx === currentQuoteIndex ? 'active' : ''}`}
                onClick={() => setCurrentQuoteIndex(idx)}
              />
            ))}
          </div>
        </div>
        <div className="branding">
          <h1>CODDS</h1>
          <p>Cognitive Originality Drift Detection System</p>
        </div>
      </motion.div>

      {/* Right Side - Form */}
      <motion.div
        className="form-section"
        initial={{ opacity: 0, x: 50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.8 }}
      >
        <div className="form-container">
          <h2>{isLogin ? 'Welcome Back' : 'Create Account'}</h2>
          <p className="subtitle">
            {isLogin ? 'Log in to your account' : 'Join us to detect AI drift'}
          </p>

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Username</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter your username"
                required
              />
            </div>

            {!isLogin && (
              <div className="form-group">
                <label>Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  required
                />
              </div>
            )}

            <div className="form-group">
              <label>Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                required
              />
            </div>

            {!isLogin && (
              <div className="form-group">
                <label>Confirm Password</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm your password"
                  required
                />
              </div>
            )}

            {error && <div className="error-message">{error}</div>}

            <motion.button
              type="submit"
              className="form-button"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              disabled={loading}
            >
              {loading ? 'Processing...' : isLogin ? 'Login' : 'Sign Up'}
            </motion.button>
          </form>

          <div className="toggle-form">
            <p>
              {isLogin ? "Don't have an account?" : 'Already have an account?'}
              <button
                type="button"
                onClick={() => {
                  setIsLogin(!isLogin);
                  setError('');
                }}
              >
                {isLogin ? 'Sign Up' : 'Login'}
              </button>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
