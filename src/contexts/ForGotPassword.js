import React, { useState } from 'react';
import toast from 'react-hot-toast';
import api from '../services/api';
import { useNavigate } from 'react-router-dom';
import { 
  Mail, 
  Send, 
  ArrowLeft, 
  Shield, 
  CheckCircle,
  AlertCircle
} from 'lucide-react';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [isEmailSent, setIsEmailSent] = useState(false);
  const navigate = useNavigate();

  const validateEmail = (email) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateEmail(email)) {
      toast.error('Please enter a valid email address');
      return;
    }

    setLoading(true);

    try {
      const response = await api.post('/users/forgot-password', { email });
      
      toast.success(response.data.message);
      setIsEmailSent(true);
      
      setTimeout(() => {
        navigate('/login');
      }, 3000);

    } catch (error) {
      toast.error(
        error.response?.data?.error ||
        error.response?.data?.message ||
        error.message ||
        "Something went wrong"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900">
      <div className="relative z-10 w-full max-w-md px-4">
        {/* Main Card */}
        <div className="bg-gray-800 rounded-lg shadow-2xl p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex p-3 bg-gray-700 rounded-full mb-4">
              <Mail className="w-10 h-10 text-blue-400" />
            </div>
            <h2 className="text-2xl font-semibold text-white mb-2">
              Forgot Password?
            </h2>
            <p className="text-gray-400 text-sm">
              Enter your email address and we'll send you a link to reset your password
            </p>
          </div>

          {!isEmailSent ? (
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Email Input */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-gray-500" />
                  </div>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full pl-10 pr-4 py-2.5 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="you@example.com"
                  />
                </div>
                {email && !validateEmail(email) && (
                  <div className="flex items-center gap-2 mt-2 text-amber-500 text-xs">
                    <AlertCircle className="w-3 h-3" />
                    <span>Please enter a valid email address</span>
                  </div>
                )}
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Sending...
                  </>
                ) : (
                  <>
                    Send Reset Link
                    <Send className="w-4 h-4" />
                  </>
                )}
              </button>

              {/* Divider */}
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-700"></div>
                </div>
                <div className="relative flex justify-center text-xs">
                  <span className="px-2 bg-gray-800 text-gray-500">or</span>
                </div>
              </div>

              {/* Back to Login */}
              <button
                type="button"
                onClick={() => navigate('/login')}
                className="w-full py-2 text-gray-400 hover:text-white font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Login
              </button>
            </form>
          ) : (
            // Success State
            <div className="text-center space-y-4">
              <div className="inline-flex p-3 bg-gray-700 rounded-full">
                <CheckCircle className="w-10 h-10 text-green-400" />
              </div>
              <h3 className="text-xl font-semibold text-white">Check Your Email!</h3>
              <p className="text-gray-400 text-sm">
                We've sent a password reset link to{' '}
                <span className="font-medium text-gray-300">{email}</span>
              </p>
              <p className="text-gray-500 text-xs">
                Redirecting to login page...
              </p>
              <div className="w-full bg-gray-700 rounded-full h-1 overflow-hidden">
                <div className="h-full bg-blue-600 rounded-full" style={{ width: '100%' }}></div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Note */}
        <div className="text-center mt-6">
          <p className="text-gray-500 text-xs flex items-center justify-center gap-1">
            <Shield className="w-3 h-3" />
            Secure password reset • Link expires in 10 minutes
          </p>
          <p className="text-gray-600 text-xs mt-2">
            Didn't receive the email? Check your spam folder
          </p>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;