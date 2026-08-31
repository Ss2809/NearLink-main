import { MapPin } from "lucide-react";
import {
  FaFacebookF,
  FaTwitter,
  FaInstagram,
  FaLinkedinIn,
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";

function Footer() {
  const navigate = useNavigate();

  return (
    <footer className="border-t border-gray-200 bg-white mt-10">
      <div className="max-w-7xl mx-auto px-6 py-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">

        {/* Logo */}
        <div>
          <div
            onClick={() => navigate("/")}
            className="flex items-center gap-2 text-green-600 font-bold text-xl cursor-pointer"
          >
            <MapPin size={28} />
            Local Connect
          </div>

          <p className="text-gray-500 mt-4 leading-7">
            Connecting communities,
            <br />
            one connection at a time.
          </p>
        </div>

        {/* Quick Links */}
        <div>
          <h3 className="font-semibold mb-4">
            Quick Links
          </h3>

          <ul className="space-y-2 text-gray-500">
            <li
              onClick={() => navigate("/")}
              className="cursor-pointer hover:text-green-600"
            >
              Home
            </li>

            <li
              onClick={() => navigate("/businesses")}
              className="cursor-pointer hover:text-green-600"
            >
              Businesses
            </li>

            <li
              onClick={() => navigate("/activities")}
              className="cursor-pointer hover:text-green-600"
            >
              Activities
            </li>

            <li
              onClick={() => navigate("/chat")}
              className="cursor-pointer hover:text-green-600"
            >
              Chats
            </li>
          </ul>
        </div>

        {/* Community */}
        <div>
          <h3 className="font-semibold mb-4">
            Community
          </h3>

          <ul className="space-y-2 text-gray-500">
            <li className="cursor-pointer hover:text-green-600">
              About Us
            </li>

            <li className="cursor-pointer hover:text-green-600">
              How it Works
            </li>

            <li className="cursor-pointer hover:text-green-600">
              Safety
            </li>

            <li className="cursor-pointer hover:text-green-600">
              Blog
            </li>
          </ul>
        </div>

        {/* Support */}
        <div>
          <h3 className="font-semibold mb-4">
            Support
          </h3>

          <ul className="space-y-2 text-gray-500">
            <li className="cursor-pointer hover:text-green-600">
              Help Center
            </li>

            <li className="cursor-pointer hover:text-green-600">
              Contact Us
            </li>

            <li className="cursor-pointer hover:text-green-600">
              Privacy Policy
            </li>

            <li className="cursor-pointer hover:text-green-600">
              Terms of Service
            </li>
          </ul>
        </div>

        {/* Social */}
        <div>
          <h3 className="font-semibold mb-4">
            Follow Us
          </h3>

          <div className="flex gap-4">

            <button className="w-10 h-10 rounded-full border flex items-center justify-center hover:bg-gray-100 transition">
              <FaFacebookF size={18} />
            </button>

            <button className="w-10 h-10 rounded-full border flex items-center justify-center hover:bg-gray-100 transition">
              <FaTwitter size={18} />
            </button>

            <button className="w-10 h-10 rounded-full border flex items-center justify-center hover:bg-gray-100 transition">
              <FaInstagram size={18} />
            </button>

            <button className="w-10 h-10 rounded-full border flex items-center justify-center hover:bg-gray-100 transition">
              <FaLinkedinIn size={18} />
            </button>

          </div>
        </div>

      </div>

      {/* Bottom */}
      <div className="border-t border-gray-200 py-5 text-center text-sm text-gray-500">
        © 2026 Local Connect. All rights reserved.
      </div>

    </footer>
  );
}

export default Footer;