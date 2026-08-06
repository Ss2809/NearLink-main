import { Mail, Lock, ArrowRight, Eye } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { FcGoogle } from "react-icons/fc";
import { FaFacebookF } from "react-icons/fa";
import { FaMapMarkerAlt } from "react-icons/fa";
import { Link } from "react-router-dom";
import { useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";

function Login() {
  const navigate = useNavigate();
  const [email, setemail] = useState("");
  const [password, setpassword] = useState("");
  const [errors, setErrors] = useState({
    email: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setloading] = useState(false);


  const handleSubmit = async (e) => {
    
    e.preventDefault();

    let newErrors = {
      email: "",
      password: "",
    };
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
      setloading(true);
      const respones = await axios.post(
        "http://localhost:3000/api/auth/login",
        {
          email,
          password,
        },
      );
      localStorage.setItem("token", respones.data.token);
      localStorage.setItem("user", JSON.stringify(respones.data.user));

      setemail("");
      setpassword("");

     toast.success("Login Successful 🎉");

navigate("/");
    } catch (error) {
  toast.error(
    error.response?.data?.message || "Something went wrong"
  );
}
     finally {
      setloading(false);
    }
  };

  return (
    <section className="min-h-screen bg-[#0B1120] flex items-center justify-center px-8">
      <div className="w-full max-w-md bg-[#111827] border border-gray-800 rounded-3xl p-6 shadow-2xl">
        {/* Logo */}

        <div className="flex flex-col items-center">
          <FaMapMarkerAlt className="text-green-500 text-4xl" />

          <h1 className="text-3xl font-bold text-white mt-2">
            Local
            <span className="text-green-500">Connect</span>
          </h1>

          <p className="text-gray-400 mt-2">
            Discover. Connect. Support Local.
          </p>
        </div>

        {/* Heading */}

        <div className="mt-3 text-center">
          <h2 className="text-2xl font-semibold text-white">Welcome Back!</h2>

          <p className="text-gray-400 mt-1.5">Login to continue your journey</p>
        </div>

        {/* Email */}
        <form onSubmit={handleSubmit}>
          <div className="mt-4">
            <label className="text-gray-300 block mb-2">Email</label>

            <div className="flex items-center bg-[#1F2937] rounded-xl px-4 h-14">
              <Mail className="text-gray-400" size={20} />

              <input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => {
                    

                  setemail(e.target.value);
                  setErrors({
                    ...errors,
                    email: "",
                  });
                }}
                className="bg-transparent outline-none ml-3 flex-1 text-white placeholder-gray-500"
              />
            </div>

            {errors.email && (
              <p className="text-red-500 text-sm mt-2">{errors.email}</p>
            )}
          </div>

          {/* Password */}

          <div className="mt-4">
            <label className="text-gray-300 block mb-2">Password</label>

            <div className="flex items-center bg-[#1F2937] rounded-xl px-4 h-14">
              <Lock className="text-gray-400" size={20} />

              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => {
                   
                  setpassword(e.target.value);
                  setErrors({
                    ...errors,
                    password: "",
                  });
                }}
                placeholder="Enter your password"
                className="bg-transparent outline-none ml-3 flex-1 text-white placeholder-gray-500"
              />

              <Eye
                className="text-gray-400 cursor-pointer"
                size={20}
                onClick={() => setShowPassword(!showPassword)}
              />
            </div>

            {errors.password && (
              <p className="text-red-500 text-sm mt-2">{errors.password}</p>
            )}
          </div>

          {/* Forgot Password */}

          <div className="flex justify-end mt-2.5">
            <button className="text-green-500 hover:text-green-400">
              Forgot Password?
            </button>
          </div>

          {/* Login Button */}
         
  

          <button
            type="submit"
            disabled={loading}
            className={`w-full h-14 mt-6 rounded-xl flex items-center justify-center gap-2 text-white font-semibold transition ${
              loading
                ? "bg-green-300 cursor-not-allowed"
                : "bg-green-500 hover:bg-green-600"
            }`}
          >
            {loading ? "Logging in..." : "Login"}

            {!loading && <ArrowRight size={20} />}
          </button>
          <div className="flex items-center my-5">
            <div className="flex-1 h-px bg-gray-700"></div>

            <span className="mx-4 text-gray-400 text-sm">or continue with</span>

            <div className="flex-1 h-px bg-gray-700"></div>
          </div>
        </form>
        <div className="grid grid-cols-2 gap-4">
          <button className="h-12 rounded-xl bg-[#1F2937] border border-gray-700 flex items-center justify-center gap-3 text-white hover:bg-[#273447] transition">
            <FcGoogle size={24} />
            Google
          </button>

          <button className="h-12 rounded-xl bg-[#1F2937] border border-gray-700 flex items-center justify-center gap-2 text-white hover:bg-[#273447] transition">
            <FaFacebookF size={20} className="text-blue-500" />
            Facebook
          </button>
        </div>

        {/* Register */}

        <p className="text-center text-gray-400 mt-8">
          Don't have an account?
          <Link to="/register" className="text-green-500 ml-2 cursor-pointer">
            Register
          </Link>
        </p>
      </div>
    </section>
  );
}

export default Login;
