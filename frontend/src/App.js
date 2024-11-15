// src/App.jsx

import React, { useState } from 'react';
import DashboardLayout from './components/DashboardLayout';
import FileUpload from './components/FileUpload';
import DateSelector from './components/DateSelector';
import DataDisplay from './components/DataDisplay';
import ReportDisplay from './components/ReportDisplay';
import WelcomePage from './components/WelcomePage';
import MetadataForm from './components/MetadataForm';
import Report from './components/Report';

function App() {
  const [uploadedData, setUploadedData] = useState([]);
  const [selectedPeriod, setSelectedPeriod] = useState({
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear(),
  });
  const [activeTab, setActiveTab] = useState('dashboard');

  const [metadata, setMetadata] = useState(null);

  const handleDataReceived = (data) => {
    setUploadedData(data);
    setMetadata(null); // Resetar metadados ao receber novos dados
  };

  const handlePeriodChange = (period) => {
    setSelectedPeriod(period);
  };

  const handleMetadataSubmit = (metadata) => {
    setMetadata(metadata);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 p-6">
        {uploadedData.length === 0 ? (
          <>
            <WelcomePage />
            <FileUpload onDataReceived={handleDataReceived} />
          </>
        ) : (
          <>
            <FileUpload onDataReceived={handleDataReceived} />
            <DateSelector onPeriodChange={handlePeriodChange} />

            <div className="flex space-x-2 mb-4">
              <button
                className={`px-4 py-2 rounded ${
                  activeTab === 'dashboard' ? 'bg-primary text-white' : 'bg-gray-200'
                }`}
                onClick={() => setActiveTab('dashboard')}
              >
                Dashboard
              </button>
              <button
                className={`px-4 py-2 rounded ${
                  activeTab === 'report' ? 'bg-primary text-white' : 'bg-gray-200'
                }`}
                onClick={() => setActiveTab('report')}
              >
                Relatório
              </button>
            </div>

            {activeTab === 'dashboard' && (
              <DataDisplay data={uploadedData} period={selectedPeriod} />
            )}

            {activeTab === 'report' && (
              <>
                {!metadata ? (
                  <MetadataForm onSubmit={handleMetadataSubmit} />
                ) : (
                  <Report data={uploadedData} metadata={metadata} />
                )}
              </>
            )}
          </>
        )}
      </div>
    </DashboardLayout>
  );
}

export default App;
