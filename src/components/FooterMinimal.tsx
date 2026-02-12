import { Instagram, Twitter } from "lucide-react";
import cloudLogo from "@/assets/cloud-logo.png";

const FooterMinimal = () => {
  return (
    <footer className="relative py-16 bg-white border-t border-gray-100">
      <div className="container mx-auto px-6 text-center">
        {/* Centered Fitfuzz Logo */}
        <div className="mb-8">
          <img 
            src={cloudLogo} 
            alt="Fitfuzz" 
            className="h-12 w-18 mx-auto object-contain opacity-70"
          />
        </div>

        {/* Social Icons */}
        <div className="flex justify-center space-x-6 mb-8">
          <a 
            href="#" 
            className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 hover:bg-blue-100 hover:text-[#0d47a1] transition-all duration-300"
          >
            <Instagram className="w-6 h-6" />
          </a>
          <a 
            href="#" 
            className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 hover:bg-blue-100 hover:text-[#0d47a1] transition-all duration-300"
          >
            <Twitter className="w-6 h-6" />
          </a>
        </div>

        {/* Copyright */}
        <p className="text-gray-500 text-sm">
          © 2024 Fitfuzz Delivery. All rights reserved.
        </p>
      </div>
    </footer>
  );
};

export default FooterMinimal;