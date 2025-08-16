"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaEnvelope, FaLock, FaCheckCircle, FaExclamationCircle } from "react-icons/fa";
import { useRouter } from "next/navigation";
import Link from "next/link"; // Import
//  Link component
import { MdArrowBack } from "react-icons/md";

export default function ForgotPasswordFlow() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({ email: "", otp: "", newPassword: "" });
  const [message, setMessage] = useState({ text: "", type: "" }); // success / error

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const sendOtp = async () => {
    setMessage({ text: "", type: "" });
    setLoading(true);
    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: formData.email })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setMessage({ text: data.message, type: "success" });
      setStep(2);
    } catch (err) {
      setMessage({ text: err.message, type: "error" });
    }
    setLoading(false);
  };

  const verifyOtp = async () => {
    setMessage({ text: "", type: "" });
    setLoading(true);
    try {
      const res = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: formData.email, otp: formData.otp })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setMessage({ text: "OTP verified!", type: "success" });
      setStep(3);
    } catch (err) {
      setMessage({ text: err.message, type: "error" });
    }
    setLoading(false);
  };

  const resetPassword = async () => {
    setMessage({ text: "", type: "" });
    setLoading(true);
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: formData.email,
          otp: formData.otp,
          newPassword: formData.newPassword
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setMessage({ text: "Password reset successful!", type: "success" });
      setStep(4); // Move to a final success state
      setFormData({ email: "", otp: "", newPassword: "" });
    } catch (err) {
      setMessage({ text: err.message, type: "error" });
    }
    setLoading(false);
  };

  const startOver = () => {
    setStep(1);
    setFormData({ email: "", otp: "", newPassword: "" });
    setMessage({ text: "", type: "" });
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <motion.div
            key="email-step"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="w-full"
          >
            <h2 className="text-2xl font-bold mb-2 text-gray-800">Forgot Password</h2>
            <p className="text-gray-500 mb-6 text-sm">
              Enter your email to receive a verification code.
            </p>
            <div className="relative mb-4">
              <FaEnvelope className="absolute top-1/2 left-3 -translate-y-1/2 text-gray-400" />
              <input
                type="email"
                name="email"
                placeholder="Enter your email"
                value={formData.email}
                onChange={handleChange}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-300"
              />
            </div>
            <button
              onClick={sendOtp}
              disabled={loading}
              className="w-full flex items-center justify-center space-x-2 bg-blue-600 text-white py-2 rounded-lg font-semibold hover:bg-blue-700 transition duration-300 disabled:bg-blue-400"
            >
              {loading ? "Sending..." : "Send Verification Code"}
            </button>
          </motion.div>
        );
      case 2:
        return (
          <motion.div
            key="otp-step"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            <h2 className="text-2xl font-bold mb-2 text-gray-800">Verify Code</h2>
            <p className="text-gray-500 mb-6 text-sm">
              Enter the 6-digit code sent to your email.
            </p>
            <div className="relative mb-4">
              <FaLock className="absolute top-1/2 left-3 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                name="otp"
                placeholder="Enter OTP"
                value={formData.otp}
                onChange={handleChange}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-300"
              />
            </div>
            <button
              onClick={verifyOtp}
              disabled={loading}
              className="w-full flex items-center justify-center space-x-2 bg-blue-600 text-white py-2 rounded-lg font-semibold hover:bg-blue-700 transition duration-300 disabled:bg-blue-400"
            >
              {loading ? "Verifying..." : "Verify Code"}
            </button>
          </motion.div>
        );
      case 3:
        return (
          <motion.div
            key="password-step"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            <h2 className="text-2xl font-bold mb-2 text-gray-800">Reset Password</h2>
            <p className="text-gray-500 mb-6 text-sm">
              Create a new, strong password for your account.
            </p>
            <div className="relative mb-4">
              <FaLock className="absolute top-1/2 left-3 -translate-y-1/2 text-gray-400" />
              <input
                type="password"
                name="newPassword"
                placeholder="Enter new password"
                value={formData.newPassword}
                onChange={handleChange}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-300"
              />
            </div>
            <button
              onClick={resetPassword}
              disabled={loading}
              className="w-full flex items-center justify-center space-x-2 bg-green-600 text-white py-2 rounded-lg font-semibold hover:bg-green-700 transition duration-300 disabled:bg-green-400"
            >
              {loading ? "Resetting..." : "Reset Password"}
            </button>
          </motion.div>
        );
      case 4:
        return (
          <motion.div
            key="success-step"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="flex flex-col items-center text-center p-4"
          >
            <FaCheckCircle className="text-green-500 text-6xl mb-4" />
            <h2 className="text-2xl font-bold mb-2 text-gray-800">Success!</h2>
            <p className="text-gray-500 mb-6 text-sm">
              Your password has been reset successfully. You can now use your new password to log in.
            </p>
            <button
              onClick={() => { router.push('/login')}}
              className="w-full flex items-center justify-center space-x-2 bg-gray-600 text-white py-2 rounded-lg font-semibold hover:bg-gray-700 transition duration-300"
            >
              Go to Login
            </button>
          </motion.div>
        );
      default:
        return null;
    }
  };

  const getStepIndicatorClass = (stepNumber) => {
    return `relative flex-1 text-center before:content-[''] before:absolute before:top-1/2 before:left-0 before:right-0 before:h-1 before:-z-10 before:transition-colors before:duration-500
    ${stepNumber <= step ? 'before:bg-blue-600' : 'before:bg-gray-300'}
    ${stepNumber === 1 ? 'before:left-1/2' : ''}
    ${stepNumber === 4 ? 'before:right-1/2' : ''}
    `;
  };

  const getStepCircleClass = (stepNumber) => {
    return `flex items-center justify-center w-10 h-10 rounded-full transition-colors duration-500
    ${stepNumber === step ? 'bg-blue-600 text-white font-bold scale-110' : ''}
    ${stepNumber < step ? 'bg-blue-600 text-white' : ''}
    ${stepNumber > step ? 'bg-gray-300 text-gray-500' : ''}
    `;
  };

  const getStepIcon = (stepNumber) => {
    if (stepNumber < step) {
      return <FaCheckCircle />;
    }
    return stepNumber;
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-gray-100 dark:bg-[#141539] text-[#141539] dark:text-white">
      <div className="bg-white shadow-2xl md:min-w-[450px] rounded-2xl p-8 transform transition-all duration-500 ease-in-out">
        
        {/* Step Indicator (hidden on final success step) */}
        {step < 4 && (
          <div className="flex justify-between items-center mb-10 text-xs text-gray-500 uppercase font-semibold tracking-wider">
            <div className={getStepIndicatorClass(1)}>
              <div className={`mx-auto ${getStepCircleClass(1)}`}>
                {getStepIcon(1)}
              </div>
              <span className="mt-2 block">Email</span>
            </div>
            <div className={getStepIndicatorClass(2)}>
              <div className={`mx-auto ${getStepCircleClass(2)}`}>
                {getStepIcon(2)}
              </div>
              <span className="mt-2 block">Verification</span>
            </div>
            <div className={getStepIndicatorClass(3)}>
              <div className={`mx-auto ${getStepCircleClass(3)}`}>
                {getStepIcon(3)}
              </div>
              <span className="mt-2 block">New Password</span>
            </div>
          </div>
        )}

        {/* Status Message */}
        <AnimatePresence>
          {message.text && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className={`flex items-center space-x-2 p-3 mb-6 rounded-lg text-sm transition-colors duration-300 
                ${message.type === "success" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}
            >
              {message.type === "success" ? <FaCheckCircle /> : <FaExclamationCircle />}
              <span>{message.text}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Steps */}
        <AnimatePresence mode="wait">
          {renderStep()}
        </AnimatePresence>

        {/* New Back to Login link */}
        <div className="mt-8 text-center text-sm">
          <Link href="/login" className="text-blue-600 hover:underline">
            <MdArrowBack className="inline-block mr-1" />
             Back to Login
          </Link>
        </div>
      </div>
    </div>
  );
}