import { Mail, Lock, User, Eye, ArrowRight } from "lucide-react";
import { useState } from "react";
import axios from "axios";
import { FaMapMarkerAlt } from "react-icons/fa";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

function Register() {
  const navigate = useNavigate();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [errors, setErrors] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmitData = async (e) => {
    e.preventDefault();

    let newErrors = {
      fullName: "",
      email: "",
      password: "",
      confirmPassword: "",
    };

    if (!fullName.trim()) {
      newErrors.fullName = "Full Name is required";
    }

    if (!email.trim()) {
      newErrors.email = "Email is required";
    }

    if (!password.trim()) {
      newErrors.password = "Password is required";
    }

    if (!confirmPassword.trim()) {
      newErrors.confirmPassword = "Confirm Password is required";
    }

    if (password !== confirmPassword) {
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

      const response = await axios.post(
        "http://localhost:3000/api/auth/register",
        {
          fullName,
          email,
          password,
        }
      );

      toast.success("Account created successfully 🎉");

      setFullName("");
      setEmail("");
      setPassword("");
      setConfirmPassword("");

      navigate("/login");
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Registration Failed"
      );
    } finally {
      setLoading(false);
    }
  };
  return (
  <section className="min-h-screen bg-[#0B1120] flex items-center justify-center px-5 py-6">
    <div className="w-full max-w-lg bg-[#111827] border border-gray-800 rounded-3xl shadow-2xl p-6">

      {/* Logo */}

      <div className="flex flex-col items-center">
        <FaMapMarkerAlt className="text-green-500 text-4xl" />

        <h1 className="text-4xl font-bold text-white mt-2">
          Local<span className="text-green-500">Connect</span>
        </h1>

        <p className="text-gray-400 mt-2">
          Discover. Connect. Support Local.
        </p>
      </div>

      {/* Heading */}

      <div className="text-center mt-5">
        <h2 className="text-3xl font-semibold text-white">
          Create Account
        </h2>

        <p className="text-gray-400 mt-2">
          Join us and explore your local world
        </p>
      </div>

      <form onSubmit={handleSubmitData} className="mt-6">

        {/* Full Name */}

        <div className="mb-5">
          <label className="block text-gray-300 mb-2">
            Full Name
          </label>

          <div className="flex items-center bg-[#1F2937] rounded-xl px-4 h-14">
            <User className="text-gray-400" size={20} />

            <input
              type="text"
              value={fullName}
              onChange={(e) => {
                setFullName(e.target.value);
                setErrors({ ...errors, fullName: "" });
              }}
              placeholder="Enter your full name"
              className="bg-transparent ml-3 flex-1 outline-none text-white placeholder-gray-500"
            />
          </div>

          {errors.fullName && (
            <p className="text-red-500 text-sm mt-2">
              {errors.fullName}
            </p>
          )}
        </div>

        {/* Email */}

        <div className="mb-5">
          <label className="block text-gray-300 mb-2">
            Email
          </label>

          <div className="flex items-center bg-[#1F2937] rounded-xl px-4 h-14">
            <Mail className="text-gray-400" size={20} />

            <input
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setErrors({ ...errors, email: "" });
              }}
              placeholder="Enter your email"
              className="bg-transparent ml-3 flex-1 outline-none text-white placeholder-gray-500"
            />
          </div>

          {errors.email && (
            <p className="text-red-500 text-sm mt-2">
              {errors.email}
            </p>
          )}
        </div>

        {/* Password */}

        <div className="mb-5">
          <label className="block text-gray-300 mb-2">
            Password
          </label>

          <div className="flex items-center bg-[#1F2937] rounded-xl px-4 h-14">
            <Lock className="text-gray-400" size={20} />

            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setErrors({ ...errors, password: "" });
              }}
              placeholder="Create a password"
              className="bg-transparent ml-3 flex-1 outline-none text-white placeholder-gray-500"
            />

            <Eye
              className="text-gray-400 cursor-pointer"
              size={20}
              onClick={() =>
                setShowPassword(!showPassword)
              }
            />
          </div>

          {errors.password && (
            <p className="text-red-500 text-sm mt-2">
              {errors.password}
            </p>
          )}
        </div>

        {/* Confirm Password */}

        <div className="mb-6">
          <label className="block text-gray-300 mb-2">
            Confirm Password
          </label>

          <div className="flex items-center bg-[#1F2937] rounded-xl px-4 h-14">
            <Lock className="text-gray-400" size={20} />

            <input
              type={
                showConfirmPassword ? "text" : "password"
              }
              value={confirmPassword}
              onChange={(e) => {
                setConfirmPassword(e.target.value);
                setErrors({
                  ...errors,
                  confirmPassword: "",
                });
              }}
              placeholder="Confirm your password"
              className="bg-transparent ml-3 flex-1 outline-none text-white placeholder-gray-500"
            />

            <Eye
              className="text-gray-400 cursor-pointer"
              size={20}
              onClick={() =>
                setShowConfirmPassword(
                  !showConfirmPassword
                )
              }
            />
          </div>

          {errors.confirmPassword && (
            <p className="text-red-500 text-sm mt-2">
              {errors.confirmPassword}
            </p>
          )}
        </div>

        {/* Button */}

        <button
          type="submit"
          disabled={loading}
          className={`w-full h-14 rounded-xl flex items-center justify-center gap-2 text-white font-semibold text-lg transition ${
            loading
              ? "bg-green-300 cursor-not-allowed"
              : "bg-green-500 hover:bg-green-600"
          }`}
        >
          {loading ? "Registering..." : "Register"}

          {!loading && <ArrowRight size={20} />}
        </button>
      </form>

      <p className="text-center text-gray-400 mt-6">
        Already have an account?

        <Link
          to="/login"
          className="text-green-500 ml-2 hover:text-green-400"
        >
          Login
        </Link>
      </p>
    </div>
  </section>
);

}

export default Register;