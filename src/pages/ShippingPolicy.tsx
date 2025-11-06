import React from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const ShippingPolicy = () => {
  return (
    <>
      <Navbar />
      <div className="container mx-auto px-4 py-20">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold mb-8 text-center">Shipping Policy</h1>
          
          <div className="prose prose-lg max-w-none space-y-6">
            <section>
              <h2 className="text-2xl font-semibold mb-4">1. Shipping Areas</h2>
              <p className="text-gray-700 leading-relaxed">
                We currently ship throughout India. Shipping costs and delivery times may vary based on your location and the size/weight of your order. International shipping is not available at this time.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">2. Processing Time</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                Orders are typically processed within 1-2 business days after payment confirmation. Processing time may be longer during peak seasons or for custom orders. You will receive a confirmation email once your order has been processed and shipped.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">3. Delivery Time</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                Estimated delivery times:
              </p>
              <ul className="list-disc pl-6 text-gray-700 space-y-2">
                <li><strong>Within Gujarat:</strong> 2-4 business days</li>
                <li><strong>Metro Cities:</strong> 3-5 business days</li>
                <li><strong>Other Cities:</strong> 5-7 business days</li>
                <li><strong>Remote Areas:</strong> 7-10 business days</li>
              </ul>
              <p className="text-gray-700 leading-relaxed mt-4">
                Please note that these are estimated delivery times and actual delivery may vary due to factors beyond our control such as weather conditions, transportation delays, or local holidays.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">4. Shipping Charges</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                Shipping charges are calculated based on:
              </p>
              <ul className="list-disc pl-6 text-gray-700 space-y-2">
                <li>Weight and dimensions of the package</li>
                <li>Delivery location</li>
                <li>Shipping method selected</li>
              </ul>
              <p className="text-gray-700 leading-relaxed mt-4">
                Shipping charges will be displayed at checkout before you complete your purchase. We may offer free shipping promotions from time to time for orders above certain amounts.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">5. Order Tracking</h2>
              <p className="text-gray-700 leading-relaxed">
                Once your order is shipped, you will receive a tracking number via email or SMS. You can use this tracking number to monitor the progress of your shipment on our website or the courier company's website.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">6. Delivery Requirements</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                Please ensure:
              </p>
              <ul className="list-disc pl-6 text-gray-700 space-y-2">
                <li>Someone is available to receive the package during delivery hours</li>
                <li>The delivery address is complete and accurate</li>
                <li>Valid contact information is provided for delivery coordination</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">7. Failed Delivery Attempts</h2>
              <p className="text-gray-700 leading-relaxed">
                If delivery attempts fail due to incorrect address, unavailability of recipient, or refusal to accept the package, additional charges may apply for re-delivery. After multiple failed attempts, the package may be returned to us, and return shipping charges may be deducted from any refund.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">8. Damaged or Lost Packages</h2>
              <p className="text-gray-700 leading-relaxed">
                If your package arrives damaged or is lost during transit, please contact us immediately with your order number and details. We will work with the shipping carrier to resolve the issue and ensure you receive your order or a replacement.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">9. Bulk Orders</h2>
              <p className="text-gray-700 leading-relaxed">
                For bulk orders or institutional purchases, special shipping arrangements may be made. Please contact us directly to discuss shipping options and rates for large quantity orders.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">10. Contact for Shipping Queries</h2>
              <p className="text-gray-700 leading-relaxed">
                For any shipping-related questions or concerns, please contact us:
              </p>
              <div className="bg-gray-50 p-4 rounded-lg mt-4">
                <p className="font-semibold">ADITI ENTERPRISE</p>
                <p>FF122 SHREE TAPASVI ICON</p>
                <p>HATHIJAN AHMEDABAD GUJARAT 382449</p>
                <p>Phone: +918200672272</p>
                <p>Email: faststationary0@gmail.com</p>
              </div>
            </section>

            <p className="text-sm text-gray-500 mt-8">
              Last updated: {new Date().toLocaleDateString()}
            </p>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default ShippingPolicy;
