import { MapPin } from "lucide-react";

import {
  FaFacebookF,
  FaTwitter,
  FaInstagram,
  FaLinkedinIn,
} from "react-icons/fa";

function Footer() {
  return (
    <footer className="mt-20 border-t bg-white">

      <div className="max-w-7xl mx-auto px-6 py-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">

        {/* Logo */}

        <div>

          <div className="flex items-center gap-2 text-green-600 font-bold text-xl">
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

            <li>Home</li>
            <li>Businesses</li>
            <li>Activities</li>
            <li>Chats</li>

          </ul>

        </div>

        {/* Community */}

        <div>

          <h3 className="font-semibold mb-4">
            Community
          </h3>

          <ul className="space-y-2 text-gray-500">

            <li>About Us</li>
            <li>How it Works</li>
            <li>Safety</li>
            <li>Blog</li>

          </ul>

        </div>

        {/* Support */}

        <div>

          <h3 className="font-semibold mb-4">
            Support
          </h3>

          <ul className="space-y-2 text-gray-500">

            <li>Help Center</li>
            <li>Contact Us</li>
            <li>Privacy Policy</li>
            <li>Terms of Service</li>

          </ul>

        </div>

        {/* Social */}

        <div>

          <h3 className="font-semibold mb-4">
            Follow Us
          </h3>

          <div className="flex gap-4">

            <button className="w-10 h-10 rounded-full border flex items-center justify-center hover:bg-gray-100">
              <FaFacebookF size={18} />
            </button>

            <button className="w-10 h-10 rounded-full border flex items-center justify-center hover:bg-gray-100">
             <FaTwitter size={18} />
            </button>

            <button className="w-10 h-10 rounded-full border flex items-center justify-center hover:bg-gray-100">
             <FaInstagram size={18} />
            </button>

            <button className="w-10 h-10 rounded-full border flex items-center justify-center hover:bg-gray-100">
             <FaLinkedinIn size={18} />
            </button>

          </div>

        </div>

      </div>

    </footer>
  );
}

export default Footer;