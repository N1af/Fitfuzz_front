import { Mail, Phone, MapPin, Facebook, Twitter, Instagram, Youtube } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import cloudLogo from "@/assets/cloud-logo1.png";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const topBrands = ["Nike", "Adidas", "Puma", "Carnage", "Reebok", "Under Armour"];

  return (
    <footer className="bg-gradient-to-b from-blue-900 via-blue-800 to-blue-700 border-t border-blue-800 text-white">
      
      {/* ------------------------ Logo / Branding ------------------------ */}
      <div className="py-10 text-center border-b border-blue-800">
        <img
          src={cloudLogo}
          alt="Fitfuzz Logo"
          className="h-14 w-auto mx-auto object-contain opacity-90"
        />
        <h2 className="mt-3 text-xl font-brand font-semibold text-white">Fitfuzz Store</h2>
      </div>

      {/* ------------------------ Main Footer Links ------------------------ */}
      <div className="py-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
        
        {/* Company Info & Trust Signals */}
        <div className="space-y-4">
          <h4 className="text-lg font-semibold text-white">About Fitfuzz</h4>
          <p className="text-sm leading-relaxed text-white/90">
            Your destination for premium lifestyle products. Curated selections for everyday comfort and style.
          </p>
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-white/90">
              <MapPin className="h-4 w-4" />
              <span>123 Commerce St, City, State 12345</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-white/90">
              <Phone className="h-4 w-4" />
              <span>+1 (555) 123-4567</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-white/90">
              <Mail className="h-4 w-4" />
              <span>hello@fitfuzz.com</span>
            </div>
          </div>
        </div>

        {/* Quick Links */}
        <div className="space-y-4">
          <h4 className="text-lg font-semibold text-white">Quick Links</h4>
          <nav className="flex flex-col space-y-2">
            {[
              "About Us",
              "Contact",
              "Privacy Policy",
              "Terms of Service",
              "Shipping Info",
              "Returns & Exchanges",
            ].map((link) => (
              <a
                key={link}
                href="#"
                className="text-sm text-white/90 hover:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-white rounded"
              >
                {link}
              </a>
            ))}
          </nav>
        </div>

        {/* Customer Service */}
        <div className="space-y-4">
          <h4 className="text-lg font-semibold text-white">Customer Service</h4>
          <nav className="flex flex-col space-y-2">
            {[
              "Help Center",
              "Track Your Order",
              "Size Guide",
              "Care Instructions",
              "Gift Cards",
              "Wholesale",
            ].map((service) => (
              <a
                key={service}
                href="#"
                className="text-sm text-white/90 hover:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-white rounded"
              >
                {service}
              </a>
            ))}
          </nav>
        </div>

        {/* Brands (Last Column) */}
        <div className="space-y-4">
          <h4 className="text-lg font-semibold text-white">Top Brands</h4>
          <div className="grid grid-cols-2 gap-2">
            {topBrands.map((brand) => (
              <a
                key={brand}
                href="#"
                aria-label={`Shop ${brand}`}
                className="text-sm text-white/90 hover:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-white rounded"
              >
                {brand}
              </a>
            ))}
          </div>
        </div>
      </div>

      {/* ------------------------ Bottom Footer ------------------------ */}
      <div className="py-6 border-t border-blue-800">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

          {/* Copyright */}
          <p className="text-sm text-white/80">
            © {currentYear} Fitfuzz Store. All rights reserved.
          </p>

          {/* Social Media Icons */}
          <div className="flex items-center gap-3">
            {[
              { icon: Facebook, href: "#", label: "Facebook" },
              { icon: Twitter, href: "#", label: "Twitter" },
              { icon: Instagram, href: "#", label: "Instagram" },
              { icon: Youtube, href: "#", label: "YouTube" },
            ].map(({ icon: Icon, href, label }) => (
              <a
                key={label}
                href={href}
                aria-label={label}
                className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-white/20 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-white"
              >
                <Icon className="w-5 h-5" />
              </a>
            ))}
          </div>

          {/* Payment Methods */}
          <div className="flex items-center gap-3">
            <span className="text-xs text-white/80">We accept:</span>
            <div className="flex gap-2">
              {["Visa", "MasterCard", "Amex", "PayPal"].map((method) => (
                <div
                  key={method}
                  className="bg-white/10 border border-white/20 rounded px-2 py-1 text-xs text-white shadow-sm"
                >
                  {method}
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </footer>
  );
};

export default Footer;
