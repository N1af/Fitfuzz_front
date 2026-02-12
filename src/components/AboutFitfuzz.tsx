import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const AboutFitfuzz = () => {
  const navigate = useNavigate();

  return (
    <section className="bg-background py-20">
      <div className="container mx-auto px-6 max-w-5xl text-center">
        {/* Heading */}
        <h2 className="text-4xl font-bold mb-6 text-foreground">
          Welcome to Fitfuzz
        </h2>

        {/* Description */}
        <p className="text-lg text-muted-foreground mb-8">
          Fitfuzz is your ultimate online marketplace, offering a seamless shopping experience for fashion, accessories, and more. Our platform connects sellers and customers globally, making shopping effortless and rewarding.
        </p>

        {/* Benefits for Sellers */}
        <div className="grid md:grid-cols-2 gap-10 mb-10 text-left">
          <div className="bg-card rounded-xl p-6 shadow-md hover:shadow-lg transition-all">
            <h3 className="text-2xl font-semibold mb-3">Why Join as a Seller?</h3>
            <ul className="list-disc list-inside text-muted-foreground space-y-2">
              <li>Reach thousands of customers instantly.</li>
              <li>Easy-to-use seller dashboard to manage your products.</li>
              <li>Secure payment options and fast payouts.</li>
              <li>Analytics tools to track sales and performance.</li>
              <li>Promotional features to boost your visibility.</li>
            </ul>
          </div>
          <div className="bg-card rounded-xl p-6 shadow-md hover:shadow-lg transition-all">
            <h3 className="text-2xl font-semibold mb-3">Benefits for Customers</h3>
            <ul className="list-disc list-inside text-muted-foreground space-y-2">
              <li>Wide selection of quality products from trusted sellers.</li>
              <li>Seamless checkout and multiple payment options.</li>
              <li>Track your orders in real-time.</li>
              <li>Exclusive deals and discounts on popular items.</li>
              <li>Secure and reliable shopping experience.</li>
            </ul>
          </div>
        </div>

        {/* Call to Action Buttons */}
        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <Button
            onClick={() => navigate("/seller-login")}
            className="bg-accent text-white hover:bg-accent-dark transition-all px-6 py-3"
          >
            Login
          </Button>
          <Button
            onClick={() => navigate("/seller-create")}
            className="border border-accent text-accent bg-transparent hover:bg-accent hover:text-white transition-all px-6 py-3"
          >
            Create Account
          </Button>

        </div>

        
      </div>
    </section>
  );
};

export default AboutFitfuzz;
