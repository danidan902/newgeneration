import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../services/api';
import { Eye, EyeOff, Mail, Lock, ArrowLeft, ArrowRight, Key, User } from 'lucide-react';

export default function Login() {
  const [identifier, setIdentifier] = useState(''); // Can be Student ID or Email
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [redirectMessage, setRedirectMessage] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotLoading, setForgotLoading] = useState(false);
  const navigate = useNavigate();

  React.useEffect(() => {
    const savedIdentifier = localStorage.getItem('rememberedIdentifier');
    if (savedIdentifier) {
      setIdentifier(savedIdentifier);
      setRememberMe(true);
    }
  }, []);

  // Detect if identifier is email or student ID
  const isEmail = (value) => {
    return value.includes('@') && value.includes('.');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      let loginData = { password };
      
      if (!identifier) {
        toast.error('Please enter your Student ID or Email');
        setLoading(false);
        return;
      }

      // Determine if it's an email or student ID
      if (isEmail(identifier)) {
        loginData.email = identifier;
      } else {
        loginData.studentId = identifier;
      }

      const response = await api.post('/users/login', loginData);
      const { token, user, needsPasswordChange } = response.data;

      if (!token || !user) {
        throw new Error('Invalid server response');
      }

      localStorage.clear();
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      localStorage.setItem('role', user.role);

      if (rememberMe) {
        localStorage.setItem('rememberedIdentifier', identifier);
      }

      if (needsPasswordChange === true) {
        setRedirectMessage(true);
        setTimeout(() => {
          navigate('/change-password', { replace: true });
        }, 4000);
        return;
      }

      const roleRoutes = {
        superadmin: '/admin',
        admin: '/admin',
        parent: '/parent',
        teacher: '/teacher',
        student: '/student',
      };

      const redirectPath = roleRoutes[user.role] || `/${user.role}`;
      navigate(redirectPath, { replace: true });
    } catch (error) {
      console.error('Login error details:', error);
      let errorMessage = 'Login failed';
      if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
      } else if (error.message) {
        errorMessage = error.message;
      }
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    if (!forgotEmail) {
      toast.error('Please enter your email address');
      return;
    }

    setForgotLoading(true);
    try {
      const response = await api.post('/users/forgot-password', { email: forgotEmail });
      toast.success(response.data.message || 'Password reset link sent to your email!');
      setShowForgotPassword(false);
      setForgotEmail('');
    } catch (error) {
      console.error('Forgot password error:', error);
      let errorMessage = 'Failed to send reset link';
      if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
      }
      toast.error(errorMessage);
    } finally {
      setForgotLoading(false);
    }
  };

  // Redirect state
  if (redirectMessage) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0d47a1] relative overflow-hidden font-sans">
        <div className="absolute inset-0 z-0 bg-gradient-to-br from-[#1565c0] to-[#0d47a1]">
          <div className="absolute top-[-250px] right-[-150px] w-[700px] h-[700px] bg-white rounded-full"></div>
          <div className="absolute bottom-[-200px] left-[-150px] w-[500px] h-[500px] bg-[#1e88e5] rounded-full"></div>
          <div className="absolute bottom-[-50px] right-[-100px] w-[350px] h-[350px] bg-[#1565c0] rounded-full z-10"></div>
        </div>
        <div className="relative z-20 bg-white w-full max-w-[440px] px-[35px] py-[45px] rounded-[24px] shadow-2xl text-center mx-4">
          <div className="w-16 h-16 mx-auto mb-6 rounded-full border-4 border-[#1565c0] border-t-transparent animate-spin" />
          <h2 className="text-2xl font-bold text-[#0a3d80] mb-2">
            Taking you to set a new password
          </h2>
          <p className="text-[#7d8590] text-sm">One moment&hellip;</p>
        </div>
      </div>
    );
  }

  // Forgot password state
  if (showForgotPassword) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0d47a1] relative overflow-hidden font-sans">
        <div className="absolute inset-0 z-0 bg-gradient-to-br from-[#1565c0] to-[#0d47a1]">
          <div className="absolute top-[-250px] right-[-150px] w-[700px] h-[700px] bg-white rounded-full"></div>
          <div className="absolute bottom-[-200px] left-[-150px] w-[500px] h-[500px] bg-[#1e88e5] rounded-full"></div>
          <div className="absolute bottom-[-50px] right-[-100px] w-[350px] h-[350px] bg-[#1565c0] rounded-full z-10"></div>
        </div>
        
        <div className="relative z-20 bg-white w-full max-w-[440px] px-[35px] py-[45px] rounded-[24px] shadow-2xl mx-4">
          <button
            onClick={() => setShowForgotPassword(false)}
            className="mb-6 flex items-center text-sm text-[#7d8590] hover:text-[#0a3d80] transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </button>

          <h2 className="text-[28px] font-bold text-[#0a3d80] mb-2 tracking-tight">
            Reset Password
          </h2>
          <p className="text-[11px] text-[#7d8590] mb-7">
            Enter your email to receive a reset link
          </p>

          <form onSubmit={handleForgotPassword} className="flex flex-col">
            <div className="mb-4">
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-[#a0a6b2]" />
                <input
                  type="email"
                  value={forgotEmail}
                  onChange={(e) => setForgotEmail(e.target.value)}
                  className="w-full pl-12 pr-4 py-[15px] bg-[#f5f7fb] border border-transparent rounded-xl text-[13px] text-[#333] placeholder-[#a0a6b2] focus:outline-none focus:bg-white focus:border-[#1565c0] focus:ring-4 focus:ring-[#1565c0]/10 transition-all"
                  placeholder="Email"
                  required
                  autoFocus
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={forgotLoading}
              className="w-full py-[15px] bg-[#1565c0] text-white text-[14px] font-semibold rounded-xl hover:bg-[#0d47a1] hover:shadow-lg hover:shadow-blue-900/20 transition-all disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {forgotLoading ? (
                <>
                  <span className="w-5 h-5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                  <span>Sending...</span>
                </>
              ) : (
                <>
                  <span>Send Reset Link</span>
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    );
  }

  // Main sign-in view
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0d47a1] relative overflow-hidden font-sans">
      
      {/* Background Shapes */}
      <div className="absolute inset-0 z-0 bg-gradient-to-br from-[#1565c0] to-[#0d47a1]">
        <div className="absolute top-[-250px] right-[-150px] w-[700px] h-[700px] bg-white rounded-full"></div>
        <div className="absolute bottom-[-200px] left-[-150px] w-[500px] h-[500px] bg-[#1e88e5] rounded-full"></div>
        <div className="absolute bottom-[-50px] right-[-100px] w-[350px] h-[350px] bg-[#1565c0] rounded-full z-10"></div>
      </div>

      {/* Login Card Container */}
      <div className="relative z-20 bg-white w-full max-w-[440px] px-[35px] py-[45px] rounded-[24px] shadow-2xl text-center mx-4">
        
        {/* Header Typography */}
        <h2 className="text-[28px] font-bold text-[#0a3d80] mb-1 tracking-tight">Sign in</h2>
        <p className="text-[11px] text-[#7d8590] mb-7">
          Welcome back! Please sign in to continue.
        </p>

        {/* Form Elements */}
        <form onSubmit={handleSubmit} className="flex flex-col">
          
          {/* Single Field - accepts both Student ID and Email */}
          <div className="mb-4">
            <div className="relative">
              <div className="absolute left-4 top-1/2 -translate-y-1/2">
                <Key className="h-5 w-5 text-[#a0a6b2]" />
              </div>
              <input 
                type="text"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder="Student ID or Email" 
                className="w-full pl-12 pr-4 py-[15px] bg-[#f5f7fb] border border-transparent rounded-xl text-[13px] text-[#333] placeholder-[#a0a6b2] focus:outline-none focus:bg-white focus:border-[#1565c0] focus:ring-4 focus:ring-[#1565c0]/10 transition-all"
                required
                autoFocus
              />
            </div>
           
          </div>
          
          {/* Password Field */}
          <div className="mb-2">
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-[#a0a6b2]" />
              <input 
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password" 
                className="w-full pl-12 pr-12 py-[15px] bg-[#f5f7fb] border border-transparent rounded-xl text-[13px] text-[#333] placeholder-[#a0a6b2] focus:outline-none focus:bg-white focus:border-[#1565c0] focus:ring-4 focus:ring-[#1565c0]/10 transition-all"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? (
                  <EyeOff className="h-5 w-5 text-[#a0a6b2] hover:text-[#333] transition-colors" />
                ) : (
                  <Eye className="h-5 w-5 text-[#a0a6b2] hover:text-[#333] transition-colors" />
                )}
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between px-1 mb-6 -mt-1">
            <label className="flex items-center cursor-pointer select-none">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-4 h-4 rounded border-gray-300 text-[#1565c0] focus:ring-[#1565c0]/40"
              />
              <span className="ml-2 text-[11px] text-[#7d8590] font-semibold">Remember me</span>
            </label>

            <button
              type="button"
              onClick={() => setShowForgotPassword(true)}
              className="text-[11px] text-[#7d8590] font-semibold hover:text-[#1565c0] transition-colors"
            >
              Forgot Password?
            </button>
          </div>

          {/* Login Type Hint */}
         

          {/* Primary Button */}
          <button 
            type="submit"
            disabled={loading}
            className="w-full py-[15px] bg-[#1565c0] text-white text-[14px] font-semibold rounded-xl hover:bg-[#0d47a1] hover:shadow-lg hover:shadow-blue-900/20 transition-all disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <span className="w-5 h-5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                <span>Signing in...</span>
              </>
            ) : (
              <span>Sign in</span>
            )}
          </button>

          {/* Divider */}
          <div className="flex items-center text-[11px] text-[#a0a6b2] my-4">
            <div className="flex-1 border-b border-[#e2e8f0]"></div>
            <span className="px-3">or</span>
            <div className="flex-1 border-b border-[#e2e8f0]"></div>
          </div>

     
        </form>
      </div>
    </div>
  );
}