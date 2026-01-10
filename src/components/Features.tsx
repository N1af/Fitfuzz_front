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
} from "lucide-react";
import { motion } from "framer-motion";

const Features = () => {
  const features = [
    {
      icon: Shirt,
      title: "Premium Quality",
      description: "High-quality fabrics and materials that last",
      color: "bg-blue-50 text-blue-600 dark:bg-blue-950 dark:text-blue-400",
    },
    {
      icon: Sparkles,
      title: "Latest Trends",
      description: "Stay ahead with curated trending styles",
      color: "bg-green-50 text-green-600 dark:bg-green-950 dark:text-green-400",
    },
    {
      icon: Ruler,
      title: "Perfect Fit",
      description: "Detailed size guides for the perfect fit",
      color: "bg-purple-50 text-purple-600 dark:bg-purple-950 dark:text-purple-400",
    },
    {
      icon: Truck,
      title: "Fast Delivery",
      description: "Quick shipping to your doorstep",
      color: "bg-yellow-50 text-yellow-600 dark:bg-yellow-950 dark:text-yellow-400",
    },
    {
      icon: Users,
      title: "500+ Brands",
      description: "Premium brands from around the world",
      color: "bg-pink-50 text-pink-600 dark:bg-pink-950 dark:text-pink-400",
    },
    {
      icon: Clock,
      title: "24/7 Support",
      description: "Round-the-clock customer assistance",
      color: "bg-orange-50 text-orange-600 dark:bg-orange-950 dark:text-orange-400",
    },
    {
      icon: Shield,
      title: "Secure Shopping",
      description: "100% secure and encrypted transactions",
      color: "bg-red-50 text-red-600 dark:bg-red-950 dark:text-red-400",
    },
    {
      icon: RotateCcw,
      title: "Easy Returns",
      description: "Hassle-free returns within 30 days",
      color: "bg-indigo-50 text-indigo-600 dark:bg-indigo-950 dark:text-indigo-400",
    },
    {
      icon: Leaf,
      title: "Eco-Friendly",
      description: "Sustainable practices and eco-conscious fabrics",
      color: "bg-teal-50 text-teal-600 dark:bg-teal-950 dark:text-teal-400",
    },
  ];

  return (
    <section className="section-padding bg-muted/30">
      <div className="container-fluid">
        {/* Section Header */}
        <div className="space-y-4 mb-12 text-center">
          <h2 className="text-section font-bold text-3xl md:text-4xl text-blue-600">
            Why Choose Fitfuzzz
          </h2>
          <p className="text-subtitle max-w-2xl text-gray-700 dark:text-gray-300 mx-auto">
            Experience fashion like never before with our premium clothing
            collection, fast shipping, and style that fits your lifestyle
            perfectly.
          </p>
        </div>

        {/* Features Grid with animations */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              className="card-elevated p-6 text-center space-y-4 rounded-xl bg-white dark:bg-gray-800 shadow-lg"
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

        {/* Call to Action */}
      </div>
    </section>
  );
};

export default Features;
