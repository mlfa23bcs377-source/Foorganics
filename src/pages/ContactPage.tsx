import React from 'react';

const ContactPage: React.FC = () => (
  <div className="min-h-screen bg-earth-50 py-16">
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold text-earth-900 mb-6">Contact Us</h1>
      <div className="bg-white rounded-lg shadow-md p-8 space-y-4 text-earth-600">
        <p><strong className="text-earth-900">Address:</strong> 123 Organic Street, Green City, Pakistan</p>
        <p><strong className="text-earth-900">Phone:</strong> +92-300-1234567</p>
        <p><strong className="text-earth-900">Email:</strong> info@foorganics.com</p>
        <p className="text-sm text-earth-500 pt-4">For lab demo inquiries, contact your course instructor.</p>
      </div>
    </div>
  </div>
);

export default ContactPage;
