import React from 'react';

const DashboardLayout = ({ children }) => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
      <main className="container mx-auto py-6">
        {children}
      </main>
    </div>
  );
};

export default DashboardLayout;