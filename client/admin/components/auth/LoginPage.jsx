import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authAPI } from '../../services/api';
import coffeeLogo from '../../../assets/images/coffee crop logo.png';
import bgImage from '../../../assets/images/bg1.png';
import AlertModal from '../ui/AlertModal';
import { LoggingInModal } from '../ui/LoadingModal';

// Main login page component
const LoginPage = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({ username: '', password: '' });
  const [touched, setTouched] = useState({ username: false, password: false });
  const [alertOpen, setAlertOpen] = useState(false);
  const [redirectAfterAlert, setRedirectAfterAlert] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [loggingOpen, setLoggingOpen] = useState(false);

  // Validation function for form inputs
  const validate = (values) => {
    const nextErrors = { username: '', password: '' };
    const uname = String(values.username || '').trim();
    const pwd = String(values.password || '');

    if (!uname) {
      nextErrors.username = 'Username is required';
    } else if (uname.length < 3 || uname.length > 32) {
      nextErrors.username = 'Username must be 3-32 characters';
    } else if (!/^[a-zA-Z0-9._-]+$/.test(uname)) {
      nextErrors.username = 'Use letters, numbers, dot, underscore or hyphen';
    }

    if (!pwd) {
      nextErrors.password = 'Password is required';
    } else if (pwd.length < 6) {
      nextErrors.password = 'Password must be at least 6 characters';
    }

    return nextErrors;
  };

  // Redirect authenticated users to dashboard
  useEffect(() => {
    try {
      const token = localStorage.getItem('auth_token');
      if (token) {
        // Validate token before redirecting
        authAPI.me()
          .then(() => {
            navigate('/dashboard', { replace: true });
          })
          .catch(() => {
            // Token is invalid, clear storage
            try {
              localStorage.removeItem('auth_token');
              localStorage.removeItem('auth_user');
            } catch (_) {}
          });
      }
    } catch (_) {}
  }, [navigate]);

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitted(true);

    const nextErrors = validate({ username, password });
    setErrors(nextErrors);
    setTouched({ username: true, password: true });
    if (nextErrors.username || nextErrors.password) return;

    setLoading(true);
    const startTime = Date.now();
    setLoggingOpen(true);
    try {
      const res = await authAPI.login(String(username).trim(), password);
      if (res && res.token) {
        localStorage.setItem('auth_token', res.token);
        localStorage.setItem('auth_user', JSON.stringify(res.user));
        const elapsed = Date.now() - startTime;
        const delay = Math.max(0, 1000 - elapsed);
        setTimeout(() => {
          setLoggingOpen(false);
          setRedirectAfterAlert(true);
          setAlertOpen(true);
        }, delay);
      }
    } catch (err) {
      setError(err.message || 'Login failed');
      setLoggingOpen(false);
    } finally {
      setLoading(false);
    }
  };

  // Handle input blur events
  const handleBlur = (field) => () => {
    setTouched((t) => ({ ...t, [field]: true }));
    if (submitted) {
      setErrors(validate({ username, password }));
    }
  };

  // Handle input change events
  const handleChange = (setter) => (e) => {
    setter(e.target.value);
    if (submitted) {
      setErrors(validate({ 
        username: e.target.name === 'username' ? e.target.value : username, 
        password: e.target.name === 'password' ? e.target.value : password 
      }));
    }
  };

  // Style objects for UI components
  const container = {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundImage: `linear-gradient(rgba(0,0,0,0.7), rgba(0,0,0,0.5)), url(${bgImage})`,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundRepeat: 'no-repeat'
  };

  const card = {
    background: 'white',
    padding: '2rem 2rem 5rem 2rem',
    borderRadius: '8px',
    boxShadow: '0 10px 20px var(--shadow-color)',
    width: '100%',
    maxWidth: 400,
    border: '1px solid #e9ecef'
  };

  const input = {
    width: '100%',
    padding: '0.75rem 1rem',
    marginBottom: 0,
    borderRadius: 8,
    border: '1px solid #e9ecef',
    fontSize: '0.8rem',
    outline: 'none'
  };

  const button = {
    width: '100%',
    padding: '0.75rem 1rem',
    borderRadius: 8,
    border: 'none',
    background: 'var(--dark-green)',
    color: 'white',
    fontWeight: 700,
    cursor: 'pointer'
  };

  const title = { marginBottom: '.25rem', color: 'var(--dark-green)', textAlign: 'center' };
  const subtitle = { marginBottom: '1.1rem', color: 'var(--dark-brown)', textAlign: 'center', fontWeight: 500, fontSize: '0.95rem' };
  const err = { color: '#b00020', marginBottom: '1rem' };
  const label = { fontWeight: 600, color: 'var(--dark-green)', marginBottom: 0, display: 'block' };
  const fieldError = { color: '#b00020', fontSize: '0.85rem', marginTop: '0.25rem', marginBottom: 0 };
  const headerWrap = { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem', marginBottom: '2rem' };
  const logo = { height: 56, width: 'auto' };
  const formGroup = { display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1rem' };
  
  const showUsernameError = submitted && touched.username && Boolean(errors.username);
  const showPasswordError = submitted && touched.password && Boolean(errors.password);

  // Handle alert modal close
  const handleAlertClose = () => {
    setAlertOpen(false);
    if (redirectAfterAlert) {
      navigate('/dashboard', { replace: true });
    }
  };

  return (
    <div style={container}>
      <form style={card} onSubmit={handleSubmit} noValidate>
        <div style={headerWrap}>
          <img src={coffeeLogo} alt="Coffee Crop Logo" style={logo} />
          <h2 style={title}>Coffee Crop Monitoring</h2>
          <div style={subtitle}>Administrator Access</div>
        </div>
        {error ? <div style={err}>{error}</div> : null}

        <div style={formGroup}>
          <label style={label} htmlFor="username">Username</label>
          <input
            id="username"
            name="username"
            style={{
              ...input,
              borderColor: showUsernameError ? '#b00020' : '#e9ecef',
              boxShadow: showUsernameError ? '0 0 0 3px rgba(176,0,32,0.08)' : 'none'
            }}
            type="text"
            placeholder="Enter your username"
            value={username}
            onChange={handleChange(setUsername)}
            onBlur={handleBlur('username')}
            autoComplete="username"
            autoFocus
            required
            aria-invalid={Boolean(showUsernameError)}
            aria-describedby="username-error"
          />
          {showUsernameError ? (
            <div id="username-error" style={fieldError}>{errors.username}</div>
          ) : null}
        </div>

        <div style={formGroup}>
          <label style={label} htmlFor="password">Password</label>
          <input
            id="password"
            name="password"
            style={{
              ...input,
              borderColor: showPasswordError ? '#b00020' : '#e9ecef',
              boxShadow: showPasswordError ? '0 0 0 3px rgba(176,0,32,0.08)' : 'none'
            }}
            type="password"
            placeholder="Enter your password"
            value={password}
            onChange={handleChange(setPassword)}
            onBlur={handleBlur('password')}
            autoComplete="current-password"
            required
            aria-invalid={Boolean(showPasswordError)}
            aria-describedby="password-error"
          />
          {showPasswordError ? (
            <div id="password-error" style={fieldError}>{errors.password}</div>
          ) : null}
        </div>

        <button style={{
          ...button,
          marginTop: '0.25rem',
          opacity: loading ? 0.85 : 1,
          filter: loading ? 'grayscale(0.1)' : 'none'
        }} type="submit" disabled={loading}>
          {'Sign in'}
        </button>
      </form>
      <LoggingInModal isOpen={loggingOpen} />
      <AlertModal
        isOpen={alertOpen}
        onClose={handleAlertClose}
        type="success"
        title="Login Successful"
        message="Welcome back!"
        autoClose={true}
        autoCloseDelay={1500}
        hideButton={true}
      />
    </div>
  );
};

export default LoginPage;