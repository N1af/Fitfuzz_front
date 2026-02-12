import cloudLogo from "@/assets/cloud-logo2.png";

const Hero = () => {
  return (
    <section className="relative overflow-hidden min-h-screen flex items-center justify-center pt-12 md:pt-16">
      {/* Smooth Blue to White Gradient Background */}
      <div
        className="absolute inset-0"
        style={{
          background: "linear-gradient(to bottom, #1e3a8a, #3b82f6, #ffffff)",
        }}
      ></div>

      {/* Main Hero Content */}
      <div className="relative z-10 text-center px-6 max-w-4xl mx-auto -translate-y-4 md:-translate-y-6">
        {/* Cloud Logo */}
        <div className="mb-10">
          <img
            src={cloudLogo}
            alt="Fitfuzz Cloud Logo"
            className="gentle-float mx-auto max-w-full h-auto md:max-w-lg"
          />
        </div>

        {/* Heading & Subtext */}
        <div className="text-fade-in space-y-8">
          <h1 className="text-6xl md:text-8xl font-brand font-bold text-white tracking-tight leading-none">
            Fitfuzz Store
          </h1>
          <p className="text-xl md:text-2xl font-light text-white/90 leading-relaxed max-w-2xl mx-auto">
            All under one cloud.
          </p>
        </div>
      </div>
    </section>
  );
};

export default Hero;
