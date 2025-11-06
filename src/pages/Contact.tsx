// pages/contact.tsx
import { useState } from "react";
import { db } from "@/lib/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { Mail, MessageCircle } from "lucide-react";
import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";

export default function ContactUs() {
  const emailAddress = "contact@faststationary.com"; // change to your email
  const whatsappNumber = "+919311666793"; // change to your number

  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!form.name || !form.email || !form.message) {
      setError("Please fill in all fields.");
      return;
    }

    try {
      setLoading(true);
      await addDoc(collection(db, "contact"), {
        ...form,
        createdAt: serverTimestamp(),
      });
      setForm({ name: "", email: "", message: "" });
      setSuccess("Your message has been sent! We'll get back to you soon.");
    } catch (err) {
      console.error(err);
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
    <Navbar />
    <div className="flex flex-col items-center p-6">
      {/* Contact Card */}
      <div className="max-w-4xl w-full bg-white/40 backdrop-blur-lg rounded-2xl shadow-lg p-8 border border-white/50 text-center mt-20">
        <h2 className="text-3xl font-semibold text-primary mb-4">Contact Us</h2>
        <p className="text-gray-700 mb-6">
          Have questions or want to place an order? Get in touch with us via email or WhatsApp.
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

      {/* Contact Form */}
      <form
        onSubmit={handleSubmit}
        className="max-w-4xl w-full mt-8 bg-white/40 backdrop-blur-lg rounded-2xl shadow-lg p-8 border border-white/50"
      >
        <h3 className="text-2xl font-semibold text-primary mb-4">Send us a message</h3>

        {error && <p className="text-red-500 text-sm mb-3">{error}</p>}
        {success && <p className="text-green-600 text-sm mb-3">{success}</p>}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <input
            type="text"
            name="name"
            value={form.name}
            onChange={handleChange}
            placeholder="Your Name"
            className="p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary outline-none"
          />
          <input
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            placeholder="Your Email"
            className="p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary outline-none"
          />
        </div>

        <textarea
          name="message"
          value={form.message}
          onChange={handleChange}
          placeholder="Write your message..."
          rows={5}
          className="w-full mt-4 p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary outline-none"
        />

        <button
          type="submit"
          disabled={loading}
          className="mt-4 w-full bg-primary hover:bg-primary-dark text-primary-foreground font-semibold py-3 rounded-lg shadow-lg hover:scale-[1.02] transition-all duration-200 disabled:opacity-50"
        >
          {loading ? "Sending..." : "Send Message"}
        </button>
      </form>
    </div>
    <Footer />
    </>
  );
}
