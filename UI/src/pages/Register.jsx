import {
  MapPin,
  Mail,
  Lock,
  User,
  Eye,
  EyeOff,
  ArrowRight,
  ArrowLeft,
  Loader2,
  KeyRound,
  CheckCircle2,
  RefreshCw,
  Edit3,
} from "lucide-react";
import { useState, useEffect } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { FcGoogle } from "react-icons/fc";
import { FaFacebookF } from "react-icons/fa";
import { AUTH_API_URL } from "../config/api";

function Register() {
  const navigate = useNavigate();

  // Step: 1 = Details Form, 2 = OTP Verification
  const [step, setStep] = useState(1);

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [otp, setOtp] = useState("");

  const [errors, setErrors] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
    otp: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);

  // Countdown timer for OTP resend
  useEffect(() => {
    let timer;
    if (resendCooldown > 0) {
      timer = setInterval(() => {
        setResendCooldown((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [resendCooldown]);

  // Step 1: Validate inputs and Send OTP
  const handleSendOtp = async (e) => {
    e.preventDefault();

    const newErrors = {
      fullName: "",
      email: "",
      password: "",
      confirmPassword: "",
      otp: "",
    };

    if (!fullName.trim()) {
      newErrors.fullName = "Full Name is required";
    } else if (fullName.trim().length < 2) {
      newErrors.fullName = "Full Name must be at least 2 characters";
    }

    if (!email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      newErrors.email = "Please provide a valid email address";
    }

    if (!password.trim()) {
      newErrors.password = "Password is required";
    } else if (password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    if (!confirmPassword.trim()) {
      newErrors.confirmPassword = "Confirm Password is required";
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    if (
      newErrors.fullName ||
      newErrors.email ||
      newErrors.password ||
      newErrors.confirmPassword
    ) {
      setErrors(newErrors);
      return;
    }

    try {
      setLoading(true);

      const res = await axios.post(`${AUTH_API_URL}/send-otp`, {
        email: email.trim().toLowerCase(),
      });

      toast.success(res.data.message || "Verification code sent to your email!");
      setStep(2);
      setResendCooldown(60);
    } catch (error) {
      console.error("Send OTP error:", error);
      toast.error(
        error.response?.data?.message || "Failed to send verification code."
      );
    } finally {
      setLoading(false);
    }
  };

  // Resend OTP
  const handleResendOtp = async () => {
    if (resendCooldown > 0 || loading) return;

    try {
      setLoading(true);
      const res = await axios.post(`${AUTH_API_URL}/send-otp`, {
        email: email.trim().toLowerCase(),
      });

      toast.success(res.data.message || "New verification code sent!");
      setResendCooldown(60);
    } catch (error) {
      console.error("Resend OTP error:", error);
      toast.error(
        error.response?.data?.message || "Failed to resend code."
      );
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Verify OTP & Complete Registration
  const handleVerifyOtpAndRegister = async (e) => {
    e.preventDefault();

    if (!otp.trim() || otp.trim().length < 4) {
      setErrors((prev) => ({
        ...prev,
        otp: "Please enter the 6-digit verification code",
      }));
      return;
    }

    try {
      setLoading(true);

      await axios.post(`${AUTH_API_URL}/verify-otp-and-register`, {
        fullName: fullName.trim(),
        email: email.trim().toLowerCase(),
        password,
        otp: otp.trim(),
      });

      toast.success("Account created successfully! 🎉 Please log in.");
      navigate("/login");
    } catch (error) {
      console.error("Verify OTP error:", error);
      toast.error(
        error.response?.data?.message || "Invalid or expired verification code."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="min-h-screen bg-[#0F172A] relative flex items-center justify-center px-4 py-8 overflow-hidden">
      {/* Background Ambient Glows */}
      <div className="absolute top-1/4 -right-20 w-96 h-96 bg-green-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 -left-20 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Back to Home button */}
      <button
        onClick={() => navigate("/")}
        className="absolute top-6 left-6 flex items-center gap-2 text-slate-400 hover:text-white text-xs font-semibold px-3.5 py-2 rounded-xl bg-slate-800/60 hover:bg-slate-800 border border-slate-700/60 transition shadow-xs"
      >
        <ArrowLeft size={16} />
        Back to Home
      </button>

      <div className="w-full max-w-lg bg-[#1E293B]/90 backdrop-blur-xl border border-slate-700/80 rounded-3xl p-6 sm:p-8 shadow-2xl relative z-10">
        {/* Logo & Heading */}
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

          <div className="mt-4">
            <h2 className="text-xl sm:text-2xl font-bold text-white">
              {step === 1 ? "Create an Account" : "Verify Your Email"}
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              {step === 1
                ? "Join your local neighborhood and start exploring today"
                : `We sent a 6-digit verification code to ${email}`}
            </p>
          </div>
        </div>

        {/* Step Indicator */}
        <div className="flex items-center justify-center gap-2 my-5">
          <div
            className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold transition ${
              step === 1
                ? "bg-green-500/20 text-green-400 border border-green-500/30"
                : "bg-slate-800 text-slate-400"
            }`}
          >
            <span>1</span> Details
          </div>

          <div className="w-6 h-px bg-slate-700" />

          <div
            className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold transition ${
              step === 2
                ? "bg-green-500/20 text-green-400 border border-green-500/30"
                : "bg-slate-800 text-slate-400"
            }`}
          >
            <span>2</span> Email OTP
          </div>
        </div>

        {/* ======================================================== */}
        {/* STEP 1: REGISTRATION DETAILS FORM */}
        {/* ======================================================== */}
        {step === 1 && (
          <form onSubmit={handleSendOtp} className="space-y-4">
            {/* Full Name */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Full Name
              </label>
              <div
                className={`flex items-center bg-slate-800/90 border rounded-2xl px-3.5 h-12 transition ${
                  errors.fullName
                    ? "border-red-500 focus-within:ring-2 focus-within:ring-red-500"
                    : "border-slate-700 focus-within:border-green-500 focus-within:ring-2 focus-within:ring-green-500/20"
                }`}
              >
                <User className="text-slate-400 shrink-0" size={18} />
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => {
                    setFullName(e.target.value);
                    setErrors({ ...errors, fullName: "" });
                  }}
                  placeholder="e.g. Rahul Sharma"
                  className="bg-transparent ml-2.5 flex-1 outline-none text-sm text-white placeholder-slate-500 min-w-0"
                />
              </div>
              {errors.fullName && (
                <p className="text-red-400 text-xs mt-1.5 ml-1">
                  {errors.fullName}
                </p>
              )}
            </div>

            {/* Email */}
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
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setErrors({ ...errors, email: "" });
                  }}
                  placeholder="name@example.com"
                  className="bg-transparent ml-2.5 flex-1 outline-none text-sm text-white placeholder-slate-500 min-w-0"
                />
              </div>
              {errors.email && (
                <p className="text-red-400 text-xs mt-1.5 ml-1">{errors.email}</p>
              )}
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Password
              </label>
              <div
                className={`relative flex items-center bg-slate-800/90 border rounded-2xl px-3.5 h-12 transition ${
                  errors.password
                    ? "border-red-500 focus-within:ring-2 focus-within:ring-red-500"
                    : "border-slate-700 focus-within:border-green-500 focus-within:ring-2 focus-within:ring-green-500/20"
                }`}
              >
                <Lock className="text-slate-400 shrink-0" size={18} />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setErrors({ ...errors, password: "" });
                  }}
                  placeholder="Create a password (min 6 chars)"
                  className="bg-transparent ml-2.5 pr-9 flex-1 outline-none text-sm text-white placeholder-slate-500 min-w-0"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 transition p-1 flex items-center justify-center cursor-pointer"
                  title={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {errors.password && (
                <p className="text-red-400 text-xs mt-1.5 ml-1">
                  {errors.password}
                </p>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Confirm Password
              </label>
              <div
                className={`relative flex items-center bg-slate-800/90 border rounded-2xl px-3.5 h-12 transition ${
                  errors.confirmPassword
                    ? "border-red-500 focus-within:ring-2 focus-within:ring-red-500"
                    : "border-slate-700 focus-within:border-green-500 focus-within:ring-2 focus-within:ring-green-500/20"
                }`}
              >
                <Lock className="text-slate-400 shrink-0" size={18} />
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => {
                    setConfirmPassword(e.target.value);
                    setErrors({ ...errors, confirmPassword: "" });
                  }}
                  placeholder="Re-enter your password"
                  className="bg-transparent ml-2.5 pr-9 flex-1 outline-none text-sm text-white placeholder-slate-500 min-w-0"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 transition p-1 flex items-center justify-center cursor-pointer"
                  title={showConfirmPassword ? "Hide password" : "Show password"}
                >
                  {showConfirmPassword ? (
                    <EyeOff size={18} />
                  ) : (
                    <Eye size={18} />
                  )}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="text-red-400 text-xs mt-1.5 ml-1">
                  {errors.confirmPassword}
                </p>
              )}
            </div>

            {/* Continue to OTP Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full h-12 mt-4 rounded-2xl flex items-center justify-center gap-2 text-slate-950 font-bold text-sm bg-green-500 hover:bg-green-400 transition shadow-lg hover:shadow-green-500/20 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              {loading ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  Sending Verification Code...
                </>
              ) : (
                <>
                  Continue with Email OTP
                  <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>
        )}

        {/* ======================================================== */}
        {/* STEP 2: EMAIL OTP VERIFICATION FORM */}
        {/* ======================================================== */}
        {step === 2 && (
          <form onSubmit={handleVerifyOtpAndRegister} className="space-y-5">
            {/* Email Pill with Edit Action */}
            <div className="flex items-center justify-between p-3.5 bg-slate-800/80 rounded-2xl border border-slate-700">
              <div className="flex items-center gap-2.5 min-w-0">
                <Mail size={16} className="text-green-400 shrink-0" />
                <span className="text-sm font-semibold text-slate-200 truncate">
                  {email}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setStep(1)}
                className="text-xs text-green-400 hover:text-green-300 font-semibold flex items-center gap-1 shrink-0 ml-2"
              >
                <Edit3 size={13} /> Edit
              </button>
            </div>

            {/* OTP Input */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5 text-center">
                Enter 6-Digit Code
              </label>
              <div
                className={`flex items-center justify-center bg-slate-800/90 border rounded-2xl px-4 h-14 transition ${
                  errors.otp
                    ? "border-red-500 focus-within:ring-2 focus-within:ring-red-500"
                    : "border-slate-700 focus-within:border-green-500 focus-within:ring-2 focus-within:ring-green-500/20"
                }`}
              >
                <KeyRound className="text-green-500 shrink-0 mr-3" size={20} />
                <input
                  type="text"
                  maxLength="6"
                  value={otp}
                  onChange={(e) => {
                    const val = e.target.value.replace(/\D/g, "");
                    setOtp(val);
                    setErrors({ ...errors, otp: "" });
                  }}
                  placeholder="••••••"
                  className="bg-transparent text-center font-bold text-2xl tracking-[10px] outline-none text-white placeholder-slate-600 w-full"
                  autoFocus
                />
              </div>
              {errors.otp && (
                <p className="text-red-400 text-xs mt-1.5 text-center">
                  {errors.otp}
                </p>
              )}
            </div>

            {/* Resend Code Button */}
            <div className="flex items-center justify-center text-xs text-slate-400">
              {resendCooldown > 0 ? (
                <span>Resend code in {resendCooldown}s</span>
              ) : (
                <button
                  type="button"
                  onClick={handleResendOtp}
                  disabled={loading}
                  className="text-green-400 hover:text-green-300 font-semibold flex items-center gap-1.5 transition"
                >
                  <RefreshCw size={13} /> Resend Verification Code
                </button>
              )}
            </div>

            {/* Verify & Register Button */}
            <button
              type="submit"
              disabled={loading || otp.length < 4}
              className="w-full h-12 rounded-2xl flex items-center justify-center gap-2 text-slate-950 font-bold text-sm bg-green-500 hover:bg-green-400 transition shadow-lg hover:shadow-green-500/20 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              {loading ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  Verifying & Creating Account...
                </>
              ) : (
                <>
                  <CheckCircle2 size={18} />
                  Verify & Create Account
                </>
              )}
            </button>
          </form>
        )}

        {/* Divider */}
        <div className="flex items-center my-5">
          <div className="flex-1 h-px bg-slate-700/80" />
          <span className="mx-3 text-slate-400 text-xs font-medium">
            or register with
          </span>
          <div className="flex-1 h-px bg-slate-700/80" />
        </div>

        {/* Social Buttons */}
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => toast("Google authentication coming soon!", { icon: "🌐" })}
            className="h-11 rounded-2xl bg-slate-800 hover:bg-slate-700/80 border border-slate-700 text-white text-xs font-semibold flex items-center justify-center gap-2.5 transition shadow-2xs cursor-pointer"
          >
            <FcGoogle size={20} />
            Google
          </button>

          <button
            type="button"
            onClick={() => toast("Facebook authentication coming soon!", { icon: "🌐" })}
            className="h-11 rounded-2xl bg-slate-800 hover:bg-slate-700/80 border border-slate-700 text-white text-xs font-semibold flex items-center justify-center gap-2.5 transition shadow-2xs cursor-pointer"
          >
            <FaFacebookF size={16} className="text-blue-400" />
            Facebook
          </button>
        </div>

        {/* Login Footer Link */}
        <p className="text-center text-slate-400 text-xs sm:text-sm mt-6">
          Already have an account?
          <Link
            to="/login"
            className="text-green-400 hover:text-green-300 font-bold ml-1.5 transition underline underline-offset-4"
          >
            Sign in here
          </Link>
        </p>
      </div>
    </section>
  );
}

export default Register;