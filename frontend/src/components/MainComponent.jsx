// C:\Users\fagun\OneDrive\Desktop\indicadores-upa\src\components\MainComponent.jsx

import React, { useState } from 'react';
import FileUpload from './FileUpload';
import DataDisplay from './DataDisplay';

const MainComponent = () => {
  const [data, setData] = useState([]);

  const handleDataReceived = (receivedData) => {
    setData(receivedData);
  };

  return (
    <div className="space-y-6 p-6">
      <FileUpload onDataReceived={handleDataReceived} />
      <DataDisplay data={data} />
    </div>
  );
};

export default MainComponent;
