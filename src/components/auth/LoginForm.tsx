import React, { useState } from 'react';
import {
  Box,
  Paper,
  TextField,
  Button,
  Typography,
  FormControlLabel,
  Checkbox,
  Link,
  Alert,
  InputAdornment,
  IconButton,
  CircularProgress,
  MenuItem,
  Select,
  FormControl,
  InputLabel
} from '@mui/material';
import { Visibility, VisibilityOff, Login as LoginIcon, PersonAdd as RegisterIcon } from '@mui/icons-material';
import { authService, LoginRequest, RegisterRequest } from '../../services/authService';
import chettinadLogo from '../../assets/chettinad-logo.svg';

interface AuthFormProps {
  onLoginSuccess: (user: any) => void;
}

const AuthForm: React.FC<AuthFormProps> = ({ onLoginSuccess }) => {
  const [isLoginMode, setIsLoginMode] = useState(true);

  const [loginData, setLoginData] = useState<LoginRequest>({
    usernameOrEmail: '',
    password: ''
  });

  const [registerData, setRegisterData] = useState<RegisterRequest>({
    name: '',
    email: '',
    username: '',
    password: '',
    role: 'USER'
  });

  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [errors, setErrors] = useState<{[key: string]: string}>({});
  const [isLoading, setIsLoading] = useState(false);
  const [generalError, setGeneralError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const validateLoginForm = (): boolean => {
    const newErrors: {[key: string]: string} = {};

    if (!loginData.usernameOrEmail.trim()) {
      newErrors.usernameOrEmail = 'Email or Username is required';
    }

    if (!loginData.password) {
      newErrors.password = 'Password is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateRegisterForm = (): boolean => {
    const newErrors: {[key: string]: string} = {};

    if (!registerData.name.trim()) {
      newErrors.name = 'Name is required';
    } else if (registerData.name.length < 2 || registerData.name.length > 100) {
      newErrors.name = 'Name must be between 2 and 100 characters';
    }

    if (!registerData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(registerData.email)) {
      newErrors.email = 'Email is invalid';
    } else if (registerData.email.length > 100) {
      newErrors.email = 'Email must not exceed 100 characters';
    }

    if (!registerData.username.trim()) {
      newErrors.username = 'Username is required';
    } else if (registerData.username.length < 3 || registerData.username.length > 50) {
      newErrors.username = 'Username must be between 3 and 50 characters';
    }

    if (!registerData.password) {
      newErrors.password = 'Password is required';
    } else if (registerData.password.length < 6 || registerData.password.length > 100) {
      newErrors.password = 'Password must be between 6 and 100 characters';
    }

    if (!confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (registerData.password !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    if (!registerData.role) {
      newErrors.role = 'Role is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setGeneralError('');
    setSuccessMessage('');

    if (!validateLoginForm()) {
      return;
    }

    setIsLoading(true);

    try {
      const response = await authService.login(loginData);

      // Debug: Log the actual API response
      console.log('Login API Response:', response);
      console.log('Token from response:', response.token);

      // Transform the response to match our internal format
      const normalizedUser = {
        id: response.id,
        name: response.name,
        email: response.email,
        username: response.username,
        role: response.role
      };

      console.log('Normalized user:', normalizedUser);
      console.log('About to store token:', response.token);

      // Store authentication data
      authService.storeAuthData(response.token, normalizedUser);

      // Debug: Verify token was stored
      const storedToken = localStorage.getItem('accessToken');
      console.log('Token stored successfully:', !!storedToken);
      console.log('Stored token length:', storedToken ? storedToken.length : 0);

      // Store remember me preference
      if (rememberMe) {
        localStorage.setItem('rememberMe', 'true');
        localStorage.setItem('savedUsername', loginData.usernameOrEmail);
      } else {
        localStorage.removeItem('rememberMe');
        localStorage.removeItem('savedUsername');
      }

      onLoginSuccess(normalizedUser);
    } catch (error: any) {
      console.error('Login error:', error);

      if (error.response?.status === 401) {
        setGeneralError('Invalid credentials. Please check your email/username and password.');
      } else if (error.response?.status >= 500) {
        setGeneralError('Server error. Please try again later.');
      } else {
        setGeneralError('An error occurred during login. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setGeneralError('');
    setSuccessMessage('');

    if (!validateRegisterForm()) {
      return;
    }

    setIsLoading(true);

    try {
      await authService.register(registerData);

      setSuccessMessage('Registration successful! You can now sign in with your credentials.');

      // Clear form and switch to login mode
      setRegisterData({
        name: '',
        email: '',
        username: '',
        password: '',
        role: 'USER'
      });
      setConfirmPassword('');
      setIsLoginMode(true);

      // Pre-fill login form with registered email
      setLoginData(prev => ({
        ...prev,
        usernameOrEmail: registerData.email
      }));

    } catch (error: any) {
      console.error('Registration error:', error);

      if (error.response?.status === 400) {
        setGeneralError('Registration failed. Email or username may already exist.');
      } else if (error.response?.status >= 500) {
        setGeneralError('Server error. Please try again later.');
      } else {
        setGeneralError('An error occurred during registration. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleLoginInputChange = (field: keyof LoginRequest) => (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setLoginData(prev => ({
      ...prev,
      [field]: e.target.value
    }));

    // Clear field-specific error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const handleRegisterInputChange = (field: keyof RegisterRequest) => (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setRegisterData(prev => ({
      ...prev,
      [field]: e.target.value
    }));

    // Clear field-specific error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const handleConfirmPasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setConfirmPassword(e.target.value);
    if (errors.confirmPassword) {
      setErrors(prev => ({
        ...prev,
        confirmPassword: ''
      }));
    }
  };

  const handleForgotPassword = () => {
    // TODO: Implement forgot password functionality
    alert('Forgot password functionality will be implemented soon.');
  };

  const toggleMode = () => {
    setIsLoginMode(!isLoginMode);
    setErrors({});
    setGeneralError('');
    setSuccessMessage('');
  };

  // Load saved username if remember me was checked
  React.useEffect(() => {
    const savedUsername = localStorage.getItem('savedUsername');
    const rememberMeChecked = localStorage.getItem('rememberMe') === 'true';

    if (savedUsername && rememberMeChecked) {
      setLoginData(prev => ({ ...prev, usernameOrEmail: savedUsername }));
      setRememberMe(true);
    }
  }, []);

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        padding: 2
      }}
    >
      <Paper
        elevation={8}
        sx={{
          padding: 4,
          width: '100%',
          maxWidth: isLoginMode ? 400 : 500,
          borderRadius: 3
        }}
      >
        <Box sx={{ textAlign: 'center', mb: 3 }}>
          <img
            src={chettinadLogo}
            alt="Chettinad Hospital"
            style={{ height: '60px', marginBottom: '16px' }}
          />
          <Typography variant="h4" component="h1" gutterBottom color="primary">
            {isLoginMode ? 'Welcome Back' : 'Create Account'}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {isLoginMode ? 'Sign in to your account' : 'Register for a new account'}
          </Typography>
        </Box>

        {generalError && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {generalError}
          </Alert>
        )}

        {successMessage && (
          <Alert severity="success" sx={{ mb: 2 }}>
            {successMessage}
          </Alert>
        )}

        {isLoginMode ? (
          <form onSubmit={handleLogin}>
            <TextField
              fullWidth
              label="Email or Username"
              value={loginData.usernameOrEmail}
              onChange={handleLoginInputChange('usernameOrEmail')}
              error={!!errors.usernameOrEmail}
              helperText={errors.usernameOrEmail}
              margin="normal"
              variant="outlined"
              autoComplete="username"
              autoFocus
            />

            <TextField
              fullWidth
              label="Password"
              type={showPassword ? 'text' : 'password'}
              value={loginData.password}
              onChange={handleLoginInputChange('password')}
              error={!!errors.password}
              helperText={errors.password}
              margin="normal"
              variant="outlined"
              autoComplete="current-password"
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowPassword(!showPassword)}
                      edge="end"
                      aria-label="toggle password visibility"
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                )
              }}
            />

            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 2, mb: 2 }}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    color="primary"
                  />
                }
                label="Remember me"
              />

              <Link
                component="button"
                type="button"
                variant="body2"
                onClick={handleForgotPassword}
                sx={{ textDecoration: 'none' }}
              >
                Forgot password?
              </Link>
            </Box>

            <Button
              type="submit"
              fullWidth
              variant="contained"
              size="large"
              disabled={isLoading}
              startIcon={isLoading ? <CircularProgress size={20} /> : <LoginIcon />}
              sx={{
                mt: 2,
                mb: 2,
                py: 1.5,
                borderRadius: 2
              }}
            >
              {isLoading ? 'Signing in...' : 'Sign In'}
            </Button>
          </form>
        ) : (
          <form onSubmit={handleRegister}>
            <TextField
              fullWidth
              label="Full Name"
              value={registerData.name}
              onChange={handleRegisterInputChange('name')}
              error={!!errors.name}
              helperText={errors.name}
              margin="normal"
              variant="outlined"
              autoComplete="name"
              autoFocus
            />

            <TextField
              fullWidth
              label="Email"
              type="email"
              value={registerData.email}
              onChange={handleRegisterInputChange('email')}
              error={!!errors.email}
              helperText={errors.email}
              margin="normal"
              variant="outlined"
              autoComplete="email"
            />

            <TextField
              fullWidth
              label="Username"
              value={registerData.username}
              onChange={handleRegisterInputChange('username')}
              error={!!errors.username}
              helperText={errors.username}
              margin="normal"
              variant="outlined"
              autoComplete="username"
            />

            <FormControl fullWidth margin="normal" error={!!errors.role}>
              <InputLabel>Role</InputLabel>
              <Select
                value={registerData.role}
                label="Role"
                onChange={(e) => setRegisterData(prev => ({ ...prev, role: e.target.value as 'ADMIN' | 'USER' | 'MANAGER' }))}
              >
                <MenuItem value="USER">User</MenuItem>
                <MenuItem value="MANAGER">Manager</MenuItem>
                <MenuItem value="ADMIN">Admin</MenuItem>
              </Select>
              {errors.role && <Typography variant="caption" color="error" sx={{ ml: 2 }}>{errors.role}</Typography>}
            </FormControl>

            <TextField
              fullWidth
              label="Password"
              type={showPassword ? 'text' : 'password'}
              value={registerData.password}
              onChange={handleRegisterInputChange('password')}
              error={!!errors.password}
              helperText={errors.password}
              margin="normal"
              variant="outlined"
              autoComplete="new-password"
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowPassword(!showPassword)}
                      edge="end"
                      aria-label="toggle password visibility"
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                )
              }}
            />

            <TextField
              fullWidth
              label="Confirm Password"
              type={showConfirmPassword ? 'text' : 'password'}
              value={confirmPassword}
              onChange={handleConfirmPasswordChange}
              error={!!errors.confirmPassword}
              helperText={errors.confirmPassword}
              margin="normal"
              variant="outlined"
              autoComplete="new-password"
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      edge="end"
                      aria-label="toggle confirm password visibility"
                    >
                      {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                )
              }}
            />

            <Button
              type="submit"
              fullWidth
              variant="contained"
              size="large"
              disabled={isLoading}
              startIcon={isLoading ? <CircularProgress size={20} /> : <RegisterIcon />}
              sx={{
                mt: 3,
                mb: 2,
                py: 1.5,
                borderRadius: 2
              }}
            >
              {isLoading ? 'Creating Account...' : 'Create Account'}
            </Button>
          </form>
        )}

        <Box sx={{ textAlign: 'center', mt: 2 }}>
          <Typography variant="body2" color="text.secondary">
            {isLoginMode ? "Don't have an account? " : "Already have an account? "}
            <Link
              component="button"
              type="button"
              variant="body2"
              onClick={toggleMode}
              sx={{ textDecoration: 'none', fontWeight: 'bold' }}
            >
              {isLoginMode ? 'Sign up here' : 'Sign in here'}
            </Link>
          </Typography>
        </Box>
      </Paper>
    </Box>
  );
};

export default AuthForm;
