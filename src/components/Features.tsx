import {
  Shirt,
  Sparkles,
  Ruler,
  Truck,
  Shield,
  RotateCcw,
  Users,
  Clock,
  Leaf,
  X,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";

const Features = () => {
  const [activeFeature, setActiveFeature] = useState<any>(null);

  const features = [
    {
      icon: Shirt,
      title: "Premium Quality",
      description: "High-quality fabrics and materials that last",
      details:
        "Only trusted premium brands with proven quality standards. Expect long-lasting fabrics, reliable stitching, and top-tier craftsmanship so you get clothing that looks sharp, feels great, and stays durable after repeated use.",
      color: "bg-blue-50 text-blue-600 dark:bg-blue-950 dark:text-blue-400",
    },
    {
      icon: Sparkles,
      title: "Latest Trends",
      description: "Stay ahead with curated trending styles",
      details:
        "Your hub for the newest drops and hottest styles from trusted brands. Fresh collections launch here first, making Fitfuzz the go-to destination to stay ahead of fashion trends without effort.",
      color: "bg-green-50 text-green-600 dark:bg-green-950 dark:text-green-400",
    },
    {
      icon: Ruler,
      title: "Perfect Fit",
      description: "Detailed size guides for the perfect fit",
      details:
        "AI FitOn uses your body data to recommend the correct size and fit before purchase. Cuts sizing mistakes, boosts confidence, and helps you shop smarter with accurate virtual fitting guidance.",
      color: "bg-purple-50 text-purple-600 dark:bg-purple-950 dark:text-purple-400",
    },
    {
      icon: Truck,
      title: "Fast Delivery",
      description: "Quick shipping to your doorstep",
      details:
        "Fitfuzz, powered by Swiftly, delivers within 24 hours in Colombo. One-day delivery locked in. For orders outside Colombo, choose your preferred delivery date at checkout and we deliver accordingly.",
      color: "bg-yellow-50 text-yellow-600 dark:bg-yellow-950 dark:text-yellow-400",
    },
    {
      icon: Users,
      title: "50+ Brands",
      description: "Premium brands from around the world",
      details:
        "Discover 50+ premium Sri Lankan brands on one platform. Compare styles, prices, and collections instantly without switching apps, making fashion discovery simple, convenient, and time-efficient.",
      color: "bg-pink-50 text-pink-600 dark:bg-pink-950 dark:text-pink-400",
    },
    {
      icon: Clock,
      title: "24/7 Support",
      description: "Round-the-clock customer assistance",
      details:
        "Our support team is available 24/7 to assist with orders, sizing, delivery, and returns. Get help anytime, ensuring a smooth and stress-free shopping experience.",
      color: "bg-orange-50 text-orange-600 dark:bg-orange-950 dark:text-orange-400",
    },
    {
      icon: Shield,
      title: "Secure Shopping",
      description: "100% secure and encrypted transactions",
      details:
        "100% secure and encrypted checkout for safe payments. Your personal and financial data stays fully protected, providing a trusted, worry-free online shopping environment from browsing to purchase.",
      color: "bg-red-50 text-red-600 dark:bg-red-950 dark:text-red-400",
    },
    {
      icon: RotateCcw,
      title: "Easy Returns",
      description: "Hassle-free returns within 30 days",
      details:
        "Return-friendly shopping. If a brand supports returns, the policy appears clearly at checkout so you know before buying. No hidden rules, confusion, or surprises after the order arrives.",
      color: "bg-indigo-50 text-indigo-600 dark:bg-indigo-950 dark:text-indigo-400",
    },
    {
      icon: Leaf,
      title: "Eco-Friendly",
      description: "Sustainable practices and eco-conscious fabrics",
      details:
        "We promote eco-conscious brands that use sustainable materials and responsible production methods, helping reduce environmental impact while delivering quality fashion.",
      color: "bg-teal-50 text-teal-600 dark:bg-teal-950 dark:text-teal-400",
    },
  ];

  return (
    <section className="section-padding bg-muted/30">
      <div className="container-fluid">
        {/* Section Header */}
        <div className="text-center mb-8">
          <span className="text-sm tracking-[0.2em] text-muted-foreground uppercase">
              Features
            </span>
          <h2 className="font-heading text-3xl md:text-4xl lg:text-5xl font-semibold text-foreground mt-2">
            Why Choose Fitfuzzz
          </h2>
          <p className="text-muted-foreground mt-4 max-w-2xl mx-auto">
            Experience fashion like never before with our premium clothing
            collection, fast shipping, and style that fits your lifestyle
            perfectly.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              onClick={() => setActiveFeature(feature)}
              className="card-elevated p-6 text-center space-y-4 rounded-xl bg-white dark:bg-gray-800 shadow-lg cursor-pointer"
              whileHover={{ scale: 1.05 }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1, duration: 0.5 }}
            >
              <div
                className={`inline-flex items-center justify-center w-16 h-16 rounded-2xl ${feature.color} mb-3`}
              >
                <feature.icon className="w-8 h-8" />
              </div>

              <div className="space-y-2">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {feature.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed text-sm">
                  {feature.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* POPUP MODAL */}
      <AnimatePresence>
        {activeFeature && (
          <motion.div
            className="fixed inset-0 bg-black/60 backdrop-blur z-50 flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-white dark:bg-gray-900 rounded-2xl max-w-lg w-full p-6 relative"
              initial={{ scale: 0.9, y: 30 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 30 }}
            >
              <button
                onClick={() => setActiveFeature(null)}
                className="absolute top-4 right-4 text-gray-500 hover:text-gray-800 dark:hover:text-white"
              >
                <X className="w-6 h-6" />
              </button>

              <div className="flex items-center gap-4 mb-4">
                <div
                  className={`w-14 h-14 flex items-center justify-center rounded-xl ${activeFeature.color}`}
                >
                  <activeFeature.icon className="w-7 h-7" />
                </div>
                <h3 className="font-heading text-2xl font-semibold">
                  {activeFeature.title}
                </h3>
              </div>

              <p className="text-muted-foreground leading-relaxed">
                {activeFeature.details}
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
};

export default Features;
