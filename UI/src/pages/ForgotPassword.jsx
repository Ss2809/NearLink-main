import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";
import {
  MapPin,
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  ArrowLeft,
  Loader2,
  KeyRound,
  CheckCircle2,
  RotateCw,
} from "lucide-react";
import { AUTH_API_URL } from "../config/api";

function ForgotPassword() {
  const navigate = useNavigate();

  // Multi-step state: 1 = Email, 2 = Verify OTP & Set Password, 3 = Success
  const [step, setStep] = useState(1);

  // Form fields
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // UI state
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [resendTimer, setResendTimer] = useState(60);
  const [canResend, setCanResend] = useState(false);

  // Countdown timer for OTP resend
  useEffect(() => {
    let interval = null;
    if (step === 2 && resendTimer > 0) {
      interval = setInterval(() => {
        setResendTimer((prev) => prev - 1);
      }, 1000);
    } else if (resendTimer === 0) {
      setCanResend(true);
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [step, resendTimer]);

  // Step 1: Send Reset OTP
  const handleSendOtp = async (e) => {
    if (e) e.preventDefault();

    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setErrors({ email: "Please enter a valid email address" });
      return;
    }

    try {
      setLoading(true);
      setErrors({});

      const response = await axios.post(`${AUTH_API_URL}/forgot-password`, {
        email: email.trim(),
      });

      toast.success(response.data.message || "Verification code sent! 📬");
      setStep(2);
      setResendTimer(60);
      setCanResend(false);
    } catch (error) {
      console.error("Send reset OTP error:", error);
      const msg =
        error.response?.data?.message || "Failed to send reset code. Please try again.";
      toast.error(msg);
      setErrors({ email: msg });
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Verify OTP & Reset Password
  const handleResetPassword = async (e) => {
    e.preventDefault();

    const newErrors = {};
    if (!otp.trim() || otp.trim().length !== 6) {
      newErrors.otp = "Please enter the complete 6-digit code";
    }
    if (!newPassword) {
      newErrors.newPassword = "New password is required";
    } else if (newPassword.length < 6) {
      newErrors.newPassword = "Password must be at least 6 characters";
    }
    if (newPassword !== confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      setLoading(true);
      setErrors({});

      const response = await axios.post(`${AUTH_API_URL}/reset-password`, {
        email: email.trim(),
        otp: otp.trim(),
        newPassword,
      });

      toast.success(response.data.message || "Password updated successfully! 🎉");
      setStep(3);
    } catch (error) {
      console.error("Reset password error:", error);
      const msg =
        error.response?.data?.message || "Failed to reset password. Please try again.";
      toast.error(msg);
      setErrors({ form: msg });
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="min-h-screen bg-[#0F172A] relative flex items-center justify-center px-4 py-8 overflow-hidden">
      {/* Ambient background glows */}
      <div className="absolute top-1/4 -left-20 w-96 h-96 bg-green-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Back to Login button */}
      <button
        onClick={() => navigate("/login")}
        className="absolute top-6 left-6 flex items-center gap-2 text-slate-400 hover:text-white text-xs font-semibold px-3.5 py-2 rounded-xl bg-slate-800/60 hover:bg-slate-800 border border-slate-700/60 transition shadow-xs"
      >
        <ArrowLeft size={16} />
        Back to Login
      </button>

      <div className="w-full max-w-md bg-[#1E293B]/90 backdrop-blur-xl border border-slate-700/80 rounded-3xl p-6 sm:p-8 shadow-2xl relative z-10">
        {/* Brand Logo */}
        <div className="flex flex-col items-center text-center">
          <div
            onClick={() => navigate("/")}
            className="flex items-center gap-2.5 cursor-pointer select-none"
          >
            <div className="w-11 h-11 rounded-2xl bg-green-500/10 border border-green-500/30 flex items-center justify-center text-green-500 shadow-xs">
              <MapPin size={24} className="fill-green-500" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
              Local<span className="text-green-500">Connect</span>
            </h1>
          </div>
        </div>

        {/* STEP 1: Enter Email */}
        {step === 1 && (
          <div className="mt-6">
            <div className="text-center mb-6">
              <div className="w-12 h-12 bg-green-500/10 text-green-400 rounded-2xl border border-green-500/20 flex items-center justify-center mx-auto mb-3">
                <KeyRound size={24} />
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-white">
                Forgot Password?
              </h2>
              <p className="text-xs sm:text-sm text-slate-400 mt-1">
                Enter your registered email address to receive a 6-digit reset code.
              </p>
            </div>

            <form onSubmit={handleSendOtp} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Email Address
                </label>
                <div
                  className={`flex items-center bg-slate-800/90 border rounded-2xl px-3.5 h-12 transition ${
                    errors.email
                      ? "border-red-500 focus-within:ring-2 focus-within:ring-red-500"
                      : "border-slate-700 focus-within:border-green-500 focus-within:ring-2 focus-within:ring-green-500/20"
                  }`}
                >
                  <Mail className="text-slate-400 shrink-0" size={18} />
                  <input
                    type="email"
                    placeholder="name@example.com"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      setErrors({ ...errors, email: "" });
                    }}
                    className="bg-transparent outline-none ml-2.5 flex-1 text-sm text-white placeholder-slate-500"
                  />
                </div>
                {errors.email && (
                  <p className="text-red-400 text-xs mt-1.5 ml-1">{errors.email}</p>
                )}
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full h-12 bg-green-500 hover:bg-green-600 disabled:opacity-50 text-slate-950 font-bold rounded-2xl transition flex items-center justify-center gap-2 shadow-lg shadow-green-500/20 mt-6 cursor-pointer"
              >
                {loading ? (
                  <>
                    <Loader2 size={18} className="animate-spin text-slate-950" />
                    Sending Code...
                  </>
                ) : (
                  <>
                    Send Reset Code
                    <ArrowRight size={18} />
                  </>
                )}
              </button>
            </form>

            <div className="mt-6 text-center">
              <Link
                to="/login"
                className="text-xs font-medium text-slate-400 hover:text-slate-200 transition"
              >
                Remember your password?{" "}
                <span className="text-green-400 font-semibold hover:underline">
                  Sign in
                </span>
              </Link>
            </div>
          </div>
        )}

        {/* STEP 2: Enter OTP & New Password */}
        {step === 2 && (
          <div className="mt-6">
            <div className="text-center mb-6">
              <div className="w-12 h-12 bg-emerald-500/10 text-emerald-400 rounded-2xl border border-emerald-500/20 flex items-center justify-center mx-auto mb-3">
                <Lock size={24} />
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-white">
                Set New Password
              </h2>
              <div className="inline-flex items-center gap-2 mt-2 px-3 py-1 bg-slate-800 border border-slate-700 rounded-xl text-xs text-slate-300">
                <span>Code sent to <b className="text-green-400">{email}</b></span>
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="text-slate-400 hover:text-white underline text-[11px]"
                >
                  Change
                </button>
              </div>
            </div>

            <form onSubmit={handleResetPassword} className="space-y-4">
              {errors.form && (
                <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-xs text-red-400 text-center font-medium">
                  {errors.form}
                </div>
              )}

              {/* 6-Digit OTP Input */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  6-Digit Verification Code
                </label>
                <div
                  className={`flex items-center bg-slate-800/90 border rounded-2xl px-3.5 h-12 transition ${
                    errors.otp
                      ? "border-red-500 focus-within:ring-2 focus-within:ring-red-500"
                      : "border-slate-700 focus-within:border-green-500 focus-within:ring-2 focus-within:ring-green-500/20"
                  }`}
                >
                  <KeyRound className="text-slate-400 shrink-0" size={18} />
                  <input
                    type="text"
                    maxLength={6}
                    placeholder="123456"
                    value={otp}
                    onChange={(e) => {
                      setOtp(e.target.value.replace(/\D/g, ""));
                      setErrors({ ...errors, otp: "" });
                    }}
                    className="bg-transparent outline-none ml-2.5 flex-1 text-base tracking-widest font-mono text-white placeholder-slate-500"
                  />
                </div>
                {errors.otp && (
                  <p className="text-red-400 text-xs mt-1.5 ml-1">{errors.otp}</p>
                )}
              </div>

              {/* New Password */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  New Password
                </label>
                <div
                  className={`flex items-center bg-slate-800/90 border rounded-2xl px-3.5 h-12 transition ${
                    errors.newPassword
                      ? "border-red-500 focus-within:ring-2 focus-within:ring-red-500"
                      : "border-slate-700 focus-within:border-green-500 focus-within:ring-2 focus-within:ring-green-500/20"
                  }`}
                >
                  <Lock className="text-slate-400 shrink-0" size={18} />
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="At least 6 characters"
                    value={newPassword}
                    onChange={(e) => {
                      setNewPassword(e.target.value);
                      setErrors({ ...errors, newPassword: "" });
                    }}
                    className="bg-transparent outline-none ml-2.5 flex-1 text-sm text-white placeholder-slate-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="text-slate-400 hover:text-slate-200 transition p-1"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                {errors.newPassword && (
                  <p className="text-red-400 text-xs mt-1.5 ml-1">
                    {errors.newPassword}
                  </p>
                )}
              </div>

              {/* Confirm Password */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Confirm New Password
                </label>
                <div
                  className={`flex items-center bg-slate-800/90 border rounded-2xl px-3.5 h-12 transition ${
                    errors.confirmPassword
                      ? "border-red-500 focus-within:ring-2 focus-within:ring-red-500"
                      : "border-slate-700 focus-within:border-green-500 focus-within:ring-2 focus-within:ring-green-500/20"
                  }`}
                >
                  <Lock className="text-slate-400 shrink-0" size={18} />
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Repeat new password"
                    value={confirmPassword}
                    onChange={(e) => {
                      setConfirmPassword(e.target.value);
                      setErrors({ ...errors, confirmPassword: "" });
                    }}
                    className="bg-transparent outline-none ml-2.5 flex-1 text-sm text-white placeholder-slate-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="text-slate-400 hover:text-slate-200 transition p-1"
                  >
                    {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <p className="text-red-400 text-xs mt-1.5 ml-1">
                    {errors.confirmPassword}
                  </p>
                )}
              </div>

              {/* Resend Code Section */}
              <div className="flex items-center justify-between text-xs pt-1">
                <span className="text-slate-400">Didn't get the code?</span>
                {canResend ? (
                  <button
                    type="button"
                    onClick={handleSendOtp}
                    disabled={loading}
                    className="text-green-400 hover:text-green-300 font-semibold flex items-center gap-1 cursor-pointer transition"
                  >
                    <RotateCw size={12} />
                    Resend Code
                  </button>
                ) : (
                  <span className="text-slate-500 font-mono">
                    Resend in {resendTimer}s
                  </span>
                )}
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full h-12 bg-green-500 hover:bg-green-600 disabled:opacity-50 text-slate-950 font-bold rounded-2xl transition flex items-center justify-center gap-2 shadow-lg shadow-green-500/20 mt-6 cursor-pointer"
              >
                {loading ? (
                  <>
                    <Loader2 size={18} className="animate-spin text-slate-950" />
                    Updating Password...
                  </>
                ) : (
                  <>
                    Reset Password
                    <CheckCircle2 size={18} />
                  </>
                )}
              </button>
            </form>
          </div>
        )}

        {/* STEP 3: Success State */}
        {step === 3 && (
          <div className="mt-8 text-center">
            <div className="w-16 h-16 bg-green-500/10 text-green-400 rounded-full border border-green-500/30 flex items-center justify-center mx-auto mb-4 animate-bounce">
              <CheckCircle2 size={36} />
            </div>

            <h2 className="text-2xl font-bold text-white mb-2">
              Password Reset! 🎉
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 mb-6 leading-relaxed">
              Your password has been changed successfully. You can now log in with your new credentials.
            </p>

            <button
              onClick={() => navigate("/login")}
              className="w-full h-12 bg-green-500 hover:bg-green-600 text-slate-950 font-bold rounded-2xl transition flex items-center justify-center gap-2 shadow-lg shadow-green-500/20 cursor-pointer"
            >
              Sign In Now
              <ArrowRight size={18} />
            </button>
          </div>
        )}
      </div>
    </section>
  );
}

export default ForgotPassword;
