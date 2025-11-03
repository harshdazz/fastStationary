// pages/about.tsx
import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import React from "react";
import { Mail, MessageCircle } from "lucide-react"; // For icons (optional)

const About = () => {
  // Replace with your WhatsApp number (international format, without + or spaces)
  const whatsappNumber = "919876543210";
  const emailAddress = "faststationary0@gmail.com";

  return (
    <>
    <Navbar />
   <div className="min-h-screen bg-gradient-to-b from-primary/5 via-white to-primary/10 p-8 flex flex-col items-center mt-20">
      {/* About Section */}
      <div className="max-w-4xl w-full bg-white/30 backdrop-blur-lg rounded-2xl shadow-lg p-10 border border-white/50 mb-10">
        <h1 className="text-4xl font-bold text-primary mb-6 text-center">
          About FastStationary
        </h1>
        <p className="text-lg leading-relaxed text-gray-800 mb-4">
          <strong>ADITI ENTERPRISE</strong>, based in Ahmedabad, Gujarat, is a prominent
          name in the stationery industry, specializing in the supply of
          premium-quality stationery items that cater to{" "}
          <strong>educational institutions</strong>, <strong>offices</strong>, and <strong>retail markets</strong>.
        </p>

        <p className="text-lg leading-relaxed text-gray-800 mb-4">
          Their collection features an extensive range of high-quality stationery items — from <em>pens and pencils</em>, <em>notebooks and diaries</em>,
          and <em>office supplies</em> to <em>art materials</em> and{" "}
          <em>school essentials</em>. Alongside, they offer premium
          stationery products, including <em>luxury writing instruments</em>,
          <em>corporate gifts</em>, and <em>specialized office equipment</em>{" "}
          for professional environments.
        </p>

        <p className="text-lg leading-relaxed text-gray-800 mb-4">
          Each product is crafted with meticulous attention to detail, blending
          quality materials, modern design, and reliable functionality.
          Catering to diverse markets, ADITI ENTERPRISE showcases
          stationery solutions that meet various needs — from{" "}
          <strong>basic school supplies for students</strong> to{" "}
          <strong>premium office equipment for corporate clients</strong>.
        </p>

        <p className="text-lg leading-relaxed text-gray-800">
          Leveraging Ahmedabad's strategic location and Gujarat's manufacturing excellence, ADITI ENTERPRISE
          remains committed to delivering authentic, high-quality
          stationery products that combine <strong>modern functionality</strong> with{" "}
          <strong>reliable performance</strong>.
        </p>
      </div>

      {/* Contact Section */}
      <div className="max-w-4xl w-full bg-white/40 backdrop-blur-lg rounded-2xl shadow-lg p-8 border border-white/50 text-center">
        <h2 className="text-3xl font-semibold text-primary mb-4">
          Contact Us
        </h2>
        <p className="text-gray-700 mb-6">
          Have questions or want to place an order? Get in touch with us via
          email or WhatsApp.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          {/* Email Button */}
          <a
            href={`mailto:${emailAddress}`}
            className="flex items-center justify-center gap-2 bg-primary hover:bg-primary-dark text-primary-foreground px-6 py-3 rounded-xl shadow-lg transition-all duration-200"
          >
            <Mail className="w-5 h-5" />
            Email Us
          </a>

          {/* WhatsApp Button */}
          <a
            href="https://wa.link/3y9hea"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-xl shadow-lg transition-all duration-200"
          >
            <MessageCircle className="w-5 h-5" />
            WhatsApp Us
          </a>
        </div>
      </div>
    </div>
    <Footer />
    </>

  );
};

export default About;
