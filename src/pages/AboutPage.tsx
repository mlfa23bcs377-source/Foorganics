import React from 'react';

const AboutPage: React.FC = () => (
  <div className="min-h-screen bg-earth-50 py-16">
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold text-earth-900 mb-6">About FOORGANICS</h1>
      <p className="text-earth-600 leading-relaxed mb-4">
        FOORGANICS is a university e-commerce management system demo showcasing the full
        product lifecycle — from supplier purchase through inventory, store listing, customer
        orders, and payment processing.
      </p>
      <p className="text-earth-600 leading-relaxed">
        All products are organic and sustainably sourced. This MVP is built with React,
        TypeScript, Tailwind CSS, and Supabase.
      </p>
    </div>
  </div>
);

export default AboutPage;
