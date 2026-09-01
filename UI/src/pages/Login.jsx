import { useState } from "react";
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
  Sparkles,
} from "lucide-react";
import { FcGoogle } from "react-icons/fc";
import { FaFacebookF } from "react-icons/fa";
import { AUTH_API_URL } from "../config/api";

function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const newErrors = { email: "", password: "" };
    if (!email.trim()) {
      newErrors.email = "Email is required";
    }
    if (!password.trim()) {
      newErrors.password = "Password is required";
    }

    if (newErrors.email || newErrors.password) {
      setErrors(newErrors);
      return;
    }

    try {
      setLoading(true);
      const response = await axios.post(`${AUTH_API_URL}/login`, {
        email: email.trim(),
        password,
      });

      localStorage.setItem("token", response.data.token);
      localStorage.setItem("user", JSON.stringify(response.data.user));

      toast.success("Welcome back! 🎉");
      navigate("/");
    } catch (error) {
      console.error("Login error:", error);
      toast.error(
        error.response?.data?.message || "Invalid email or password"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="min-h-screen bg-[#0F172A] relative flex items-center justify-center px-4 py-8 overflow-hidden">
      {/* Background Ambient Glows */}
      <div className="absolute top-1/4 -left-20 w-96 h-96 bg-green-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Back to Home button */}
      <button
        onClick={() => navigate("/")}
        className="absolute top-6 left-6 flex items-center gap-2 text-slate-400 hover:text-white text-xs font-semibold px-3.5 py-2 rounded-xl bg-slate-800/60 hover:bg-slate-800 border border-slate-700/60 transition shadow-xs"
      >
        <ArrowLeft size={16} />
        Back to Home
      </button>

      <div className="w-full max-w-md bg-[#1E293B]/90 backdrop-blur-xl border border-slate-700/80 rounded-3xl p-6 sm:p-8 shadow-2xl relative z-10">
        {/* Logo */}
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
              Welcome Back!
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              Sign in to explore local activities & neighborhood chats
            </p>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
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

          {/* Password */}
          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label className="text-xs font-semibold text-slate-300">
                Password
              </label>
              <Link
                to="/forgot-password"
                className="text-xs text-green-400 hover:text-green-300 transition font-medium"
              >
                Forgot password?
              </Link>
            </div>

            <div
              className={`flex items-center bg-slate-800/90 border rounded-2xl px-3.5 h-12 transition ${
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
                placeholder="••••••••"
                className="bg-transparent outline-none ml-2.5 flex-1 text-sm text-white placeholder-slate-500"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="text-slate-400 hover:text-slate-200 transition p-1"
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

          {/* Login Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full h-12 mt-2 rounded-2xl flex items-center justify-center gap-2 text-slate-950 font-bold text-sm bg-green-500 hover:bg-green-400 transition shadow-lg hover:shadow-green-500/20 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            {loading ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                Signing in...
              </>
            ) : (
              <>
                Sign In
                <ArrowRight size={18} />
              </>
            )}
          </button>
        </form>

        {/* Divider */}
        <div className="flex items-center my-5">
          <div className="flex-1 h-px bg-slate-700/80" />
          <span className="mx-3 text-slate-400 text-xs font-medium">
            or continue with
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

        {/* Register Footer Link */}
        <p className="text-center text-slate-400 text-xs sm:text-sm mt-6">
          Don't have an account?
          <Link
            to="/register"
            className="text-green-400 hover:text-green-300 font-bold ml-1.5 transition underline underline-offset-4"
          >
            Create an account
          </Link>
        </p>
      </div>
    </section>
  );
}

export default Login;
