import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import api from "../services/api"; // Import the default api
import { 
  Shield, 
  Key, 
  Lock, 
  Eye, 
  EyeOff, 
  ArrowLeft
} from "lucide-react";

const ResetPassword = () => {
  const { token } = useParams();
  const navigate = useNavigate();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);

  const checkPasswordStrength = (pass) => {
    let strength = 0;
    if (pass.length >= 8) strength++;
    if (pass.match(/[a-z]/) && pass.match(/[A-Z]/)) strength++;
    if (pass.match(/[0-9]/)) strength++;
    if (pass.match(/[^a-zA-Z0-9]/)) strength++;
    setPasswordStrength(strength);
  };

  const getStrengthColor = () => {
    const colors = ["bg-red-500", "bg-orange-500", "bg-yellow-500", "bg-green-500"];
    return colors[passwordStrength - 1] || "bg-gray-600";
  };

  const getStrengthText = () => {
    const texts = ["Very Weak", "Weak", "Medium", "Strong"];
    return texts[passwordStrength - 1] || "";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      toast.error("Passwords do not match!");
      return;
    }

    if (passwordStrength < 2) {
      toast.error("Please use a stronger password!");
      return;
    }

    setLoading(true);

    try {
      // ✅ Use the correct endpoint
      const response = await api.post(`/users/reset-password/${token}`, { 
        password: password 
      });
      
      console.log("Reset response:", response.data);
      toast.success("Password reset successful! Redirecting to login...");
      
      setTimeout(() => navigate("/login"), 2000);

    } catch (error) {
      console.error("Reset error:", error.response?.data);
      
      // Better error messages
      if (error.response?.data?.error === "Invalid or expired token") {
        toast.error("This link has expired or is invalid. Please request a new password reset.");
        
        // Redirect to forgot password after 3 seconds
        setTimeout(() => navigate("/forgot-password"), 3000);
      } else {
        toast.error(error.response?.data?.error || "Failed to reset password");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900">
      <div className="relative z-10 w-full max-w-md px-4">
        <div className="bg-gray-800 rounded-lg shadow-2xl p-8">
          <div className="text-center mb-8">
            <div className="inline-flex p-3 bg-gray-700 rounded-full mb-4">
              <Shield className="w-10 h-10 text-blue-400" />
            </div>
            <h2 className="text-2xl font-semibold text-white mb-2">
              Reset Password
            </h2>
            <p className="text-gray-400 text-sm">
              Create a new strong password for your account
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                New Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-500" />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  className="w-full pl-10 pr-10 py-2.5 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    checkPasswordStrength(e.target.value);
                  }}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5 text-gray-500 hover:text-gray-300" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-500 hover:text-gray-300" />
                  )}
                </button>
              </div>

              {password && (
                <div className="mt-3 space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-400">Password Strength:</span>
                    <span className={`font-medium ${
                      passwordStrength === 1 ? 'text-red-400' :
                      passwordStrength === 2 ? 'text-orange-400' :
                      passwordStrength === 3 ? 'text-yellow-400' :
                      passwordStrength === 4 ? 'text-green-400' : 'text-gray-500'
                    }`}>
                      {getStrengthText()}
                    </span>
                  </div>
                  <div className="h-1.5 bg-gray-700 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${getStrengthColor()} rounded-full`}
                      style={{ width: `${(passwordStrength / 4) * 100}%` }}
                    ></div>
                  </div>
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Confirm Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Key className="h-5 w-5 text-gray-500" />
                </div>
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  className="w-full pl-10 pr-10 py-2.5 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-5 w-5 text-gray-500 hover:text-gray-300" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-500 hover:text-gray-300" />
                  )}
                </button>
              </div>
              {confirmPassword && (
                <div className={`mt-2 text-xs ${password === confirmPassword ? 'text-green-400' : 'text-red-400'}`}>
                  {password === confirmPassword ? '✓ Passwords match' : '✗ Passwords do not match'}
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Resetting...
                </>
              ) : (
                "Reset Password"
              )}
            </button>

            <button
              type="button"
              onClick={() => navigate("/login")}
              className="w-full py-2 text-gray-400 hover:text-white font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Login
            </button>
          </form>
        </div>

        <div className="text-center mt-6">
          <p className="text-gray-500 text-xs flex items-center justify-center gap-1">
            <Shield className="w-3 h-3" />
            Secure password reset • Link expires in 10 minutes
          </p>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;