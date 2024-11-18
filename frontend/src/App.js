import React, { useState, useEffect } from 'react';
import DataDisplay from './components/DataDisplay';
import DateSelector from './components/DateSelector';

const App = () => {
  const [data, setData] = useState([]);
  const [period, setPeriod] = useState({
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear(),
  });

  useEffect(() => {
    fetch("https://indicadores-upa-back.vercel.app/test-upload/", {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return response.json();
      })
      .then((responseData) => {
        const fileData = responseData?.data[0]?.data; // Assuming data is nested in data[0].data
        if (fileData) {
          setData(fileData);
        }
      })
      .catch((error) => {
        console.error("Error fetching data:", error);
      });
  }, []);

  return (
    <div>
      <DateSelector onPeriodChange={setPeriod} />
      <DataDisplay data={data} period={period} />
    </div>
  );
};

export default App;
