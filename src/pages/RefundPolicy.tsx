import React from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const RefundPolicy = () => {
  return (
    <>
      <Navbar />
      <div className="container mx-auto px-4 py-20">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold mb-8 text-center">Refund & Cancellation Policy</h1>
          
          <div className="prose prose-lg max-w-none space-y-6">
            <section>
              <h2 className="text-2xl font-semibold mb-4">1. Order Cancellation</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                You can cancel your order under the following conditions:
              </p>
              <ul className="list-disc pl-6 text-gray-700 space-y-2">
                <li><strong>Before Processing:</strong> Orders can be cancelled free of charge before they are processed (within 2 hours of placing the order)</li>
                <li><strong>After Processing:</strong> Once an order is processed and shipped, it cannot be cancelled but may be eligible for return</li>
              </ul>
              <p className="text-gray-700 leading-relaxed mt-4">
                To cancel an order, please contact us immediately at +918200672272 or email faststationary0@gmail.com with your order number.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">2. Return Eligibility</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                Items are eligible for return if they meet the following criteria:
              </p>
              <ul className="list-disc pl-6 text-gray-700 space-y-2">
                <li>Items are returned within 7 days of delivery</li>
                <li>Items are in original, unused condition</li>
                <li>Items are in original packaging with all tags and labels</li>
                <li>Items are not damaged due to misuse or normal wear</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">3. Non-Returnable Items</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                The following items cannot be returned:
              </p>
              <ul className="list-disc pl-6 text-gray-700 space-y-2">
                <li>Customized or personalized stationery items</li>
                <li>Items that have been used or damaged by the customer</li>
                <li>Items without original packaging or tags</li>
                <li>Perishable items or items with limited shelf life</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">4. Return Process</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                To initiate a return:
              </p>
              <ol className="list-decimal pl-6 text-gray-700 space-y-2">
                <li>Contact our customer service team within 7 days of delivery</li>
                <li>Provide your order number and reason for return</li>
                <li>Receive return authorization and shipping instructions</li>
                <li>Pack items securely in original packaging</li>
                <li>Ship items back to our return address</li>
              </ol>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">5. Refund Processing</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                Refunds will be processed as follows:
              </p>
              <ul className="list-disc pl-6 text-gray-700 space-y-2">
                <li><strong>Inspection:</strong> Returned items will be inspected within 2-3 business days</li>
                <li><strong>Approval:</strong> Refunds are approved for items meeting return criteria</li>
                <li><strong>Processing Time:</strong> Approved refunds are processed within 5-7 business days</li>
                <li><strong>Method:</strong> Refunds are issued to the original payment method</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">6. Refund Amount</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                Refund amounts include:
              </p>
              <ul className="list-disc pl-6 text-gray-700 space-y-2">
                <li>Full product price for eligible returns</li>
                <li>Original shipping charges (if the return is due to our error)</li>
              </ul>
              <p className="text-gray-700 leading-relaxed mb-4">
                Refund amounts exclude:
              </p>
              <ul className="list-disc pl-6 text-gray-700 space-y-2">
                <li>Return shipping costs (unless return is due to our error)</li>
                <li>Payment processing fees (where applicable)</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">7. Damaged or Defective Items</h2>
              <p className="text-gray-700 leading-relaxed">
                If you receive damaged or defective items, please contact us immediately with photos of the damaged items. We will provide a prepaid return label and process a full refund or replacement at no additional cost to you.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">8. Wrong Item Received</h2>
              <p className="text-gray-700 leading-relaxed">
                If you receive the wrong item, please contact us immediately. We will arrange for the correct item to be sent and provide a prepaid return label for the incorrect item. No additional charges will apply.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">9. Bulk Order Returns</h2>
              <p className="text-gray-700 leading-relaxed">
                For bulk orders or institutional purchases, special return conditions may apply. Please contact us directly to discuss return options for large quantity orders.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">10. Contact for Returns & Refunds</h2>
              <p className="text-gray-700 leading-relaxed">
                For return and refund queries, please contact us:
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

export default RefundPolicy;
