import { Sparkles, Wand2, ScanFace, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";

const AIFittingBanner = () => {
  return (
    <section className="py-16 md:py-24 relative overflow-hidden bg-white">
      {/* Floating Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-10 left-10 w-32 h-32 bg-gray-200 rounded-full blur-3xl animate-pulse" />
        <div
          className="absolute bottom-10 right-10 w-48 h-48 bg-gray-100 rounded-full blur-3xl animate-pulse"
          style={{ animationDelay: "1s" }}
        />
        <div
          className="absolute top-1/2 left-1/4 w-24 h-24 bg-gray-100 rounded-full blur-2xl animate-pulse"
          style={{ animationDelay: "0.5s" }}
        />
      </div>

      {/* Grid Pattern Overlay */}
      <div
        className="absolute inset-0 opacity-5"
        style={{
          backgroundImage: `linear-gradient(rgba(0,0,0,0.08) 1px, transparent 1px),
                            linear-gradient(90deg, rgba(0,0,0,0.08) 1px, transparent 1px)`,
          backgroundSize: "50px 50px",
        }}
      />

      <div className="container mx-auto px-4 relative z-10">
        <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-16">
          
          {/* LEFT CONTENT WITH STRONGER BLUE SMUDGE */}
          <div className="relative flex-1 text-center lg:text-left">
            <div className="absolute -inset-10 bg-gradient-to-br from-blue-200/80 via-blue-100/70 to-transparent rounded-full blur-[120px] -z-10" />

            {/* Badge */}
            <div className="inline-flex items-center gap-2 bg-gray-100 border border-gray-200 rounded-full px-4 py-2 mb-6 animate-fade-in">
              <Sparkles className="h-4 w-4 text-blue-600" />
              <span className="text-sm font-medium text-blue-600 tracking-wide">
                Coming Soon
              </span>
            </div>

            {/* Title */}
            <h2
              className="font-heading text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-6 animate-fade-in"
              style={{ animationDelay: "100ms" }}
            >
              Try Before You Buy with
              <span className="block mt-2 text-blue-600">
                AI Virtual Fitting
              </span>
            </h2>

            {/* Description */}
            <p
              className="text-lg md:text-xl text-gray-600 mb-8 max-w-xl mx-auto lg:mx-0 animate-fade-in"
              style={{ animationDelay: "200ms" }}
            >
              Experience the future of online shopping. Our revolutionary AI
              technology lets you virtually try on any dress and see exactly how
              it fits your unique body.
            </p>

            {/* CTA Buttons */}
            <div
              className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start animate-fade-in"
              style={{ animationDelay: "300ms" }}
            >
              <Button
                size="lg"
                className="text-base px-8 bg-blue-600 hover:bg-blue-700 text-white"
              >
                <Sparkles className="mr-2 h-5 w-5" />
                Join Waitlist
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="text-base px-8 border-gray-300 text-gray-800 hover:bg-gray-100"
              >
                Learn More
              </Button>
            </div>

            {/* Stats */}
            <div
              className="flex flex-wrap gap-8 justify-center lg:justify-start mt-10 animate-fade-in"
              style={{ animationDelay: "400ms" }}
            >
              <div className="text-center lg:text-left">
                <p className="text-3xl font-bold text-blue-600">50K+</p>
                <p className="text-sm text-gray-500">Waitlist Signups</p>
              </div>
              <div className="text-center lg:text-left">
                <p className="text-3xl font-bold text-blue-600">99%</p>
                <p className="text-sm text-gray-500">Fit Accuracy</p>
              </div>
              <div className="text-center lg:text-left">
                <p className="text-3xl font-bold text-blue-600">2025</p>
                <p className="text-sm text-gray-500">Launch Date</p>
              </div>
            </div>
          </div>

          {/* RIGHT FEATURE CARDS WITH BLUE SMUDGE */}
          <div className="relative flex-1 w-full max-w-md lg:max-w-none">
            <div className="absolute -inset-10 bg-gradient-to-bl from-blue-200/70 via-blue-100/60 to-transparent rounded-full blur-[120px] -z-10" />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                {
                  icon: <ScanFace className="h-6 w-6 text-blue-600" />,
                  title: "Body Scanning",
                  desc: "Advanced AI creates your perfect digital twin in seconds",
                },
                {
                  icon: <Wand2 className="h-6 w-6 text-blue-600" />,
                  title: "Virtual Try-On",
                  desc: "See exactly how any dress looks on you before purchasing",
                },
                {
                  icon: <Zap className="h-6 w-6 text-blue-600" />,
                  title: "Instant Results",
                  desc: "Get realistic fitting previews in under 3 seconds",
                },
                {
                  icon: <Sparkles className="h-6 w-6 text-blue-600" />,
                  title: "Size Recommendations",
                  desc: "AI-powered perfect size suggestions every time",
                },
              ].map((item, i) => (
                <div
                  key={i}
                  className="bg-white border border-gray-200 rounded-2xl p-6 hover:shadow-lg transition-all duration-300 hover:scale-105 animate-fade-in"
                  style={{ animationDelay: `${200 + i * 100}ms` }}
                >
                  <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center mb-4">
                    {item.icon}
                  </div>
                  <h3 className="font-heading text-lg font-semibold text-gray-900 mb-2">
                    {item.title}
                  </h3>
                  <p className="text-sm text-gray-600">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};

export default AIFittingBanner;
