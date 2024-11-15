// src/components/MetadataForm.jsx

import React, { useState } from 'react';

const MetadataForm = ({ onSubmit }) => {
  const [metadata, setMetadata] = useState({
    date: '',
    sector: '',
    author: '',
    summary: '',
  });

  const handleChange = (e) => {
    setMetadata({ ...metadata, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(metadata);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block font-medium">Data:</label>
        <input
          type="date"
          name="date"
          value={metadata.date}
          onChange={handleChange}
          required
          className="border p-2 w-full"
        />
      </div>
      <div>
        <label className="block font-medium">Setor:</label>
        <input
          type="text"
          name="sector"
          value={metadata.sector}
          onChange={handleChange}
          required
          className="border p-2 w-full"
        />
      </div>
      <div>
        <label className="block font-medium">Elaborado por:</label>
        <input
          type="text"
          name="author"
          value={metadata.author}
          onChange={handleChange}
          required
          className="border p-2 w-full"
        />
      </div>
      <div>
        <label className="block font-medium">Resumo:</label>
        <textarea
          name="summary"
          value={metadata.summary}
          onChange={handleChange}
          required
          className="border p-2 w-full"
        />
      </div>
      <button type="submit" className="px-4 py-2 bg-primary text-white rounded">
        Gerar Relatório
      </button>
    </form>
  );
};

export default MetadataForm;
