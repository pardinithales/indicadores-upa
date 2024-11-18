// C:\Users\fagun\OneDrive\Desktop\indicadores-upa\src\components\FileUpload.jsx

import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from './ui/card';
import { Alert, AlertDescription } from './ui/alert';
import { Upload, FileType, AlertCircle, Loader2 } from 'lucide-react';
import API_BASE_URL from '../api'; // Importando URL base da API

const FileUpload = ({ onDataReceived }) => {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);
  const [files, setFiles] = useState({ pdf: null, xlsx: null });
  const [dragActive, setDragActive] = useState(false);

  const validateFiles = () => {
    if (!files.pdf || !files.xlsx) {
      setError('Por favor, selecione um arquivo PDF e um arquivo Excel (XLSX).');
      return false;
    }
    return true;
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(e.type === "dragenter" || e.type === "dragover");
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const droppedFiles = Array.from(e.dataTransfer.files);
    processSelectedFiles(droppedFiles);
  };

  const handleFileSelect = (event) => {
    const selectedFiles = Array.from(event.target.files);
    processSelectedFiles(selectedFiles);
  };

  const processSelectedFiles = (selectedFiles) => {
    selectedFiles.forEach(file => {
      if (file.name.toLowerCase().endsWith('.pdf')) {
        setFiles(prev => ({ ...prev, pdf: file }));
      } else if (file.name.toLowerCase().match(/\.(xlsx|xls)$/)) {
        setFiles(prev => ({ ...prev, xlsx: file }));
      }
    });
    setError(null);
  };

  const processFiles = async () => {
    if (!validateFiles()) return;
    
    setUploading(true);
    setError(null);
    
    const formData = new FormData();
    formData.append('files', files.pdf);
    formData.append('files', files.xlsx);
    
    try {
      const response = await fetch(`${API_BASE_URL}/test-upload/`, {
        method: 'POST',
        mode: 'cors', // Isso é necessário para habilitar CORS
        headers: {
          'Accept': 'application/json', // Opcional, mas recomendado
        },
        body: formData,
      });
  
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
  
      const result = await response.json();
  
      if (result.data) {
        onDataReceived(result.data);
        setFiles({ pdf: null, xlsx: null });
      }
    } catch (error) {
      console.error('Upload error:', error);
      setError(error.message);
    } finally {
      setUploading(false);
    }
  };

  const getUploadStatus = () => {
    if (uploading) {
      return (
        <div className="flex items-center gap-2 text-primary">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span>Enviando arquivos para processamento...</span>
        </div>
      );
    }
    
    if (error) {
      return (
        <div className="text-red-500 text-sm">
          {error}
        </div>
      );
    }
    
    return null;
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Upload className="h-6 w-6" />
          Upload de Arquivos
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div
            className={`border-2 ${dragActive ? 'border-primary' : 'border-dashed'} 
                     rounded-lg p-6 text-center relative
                     ${dragActive ? 'bg-primary/10' : 'bg-background'}`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <input
              type="file"
              onChange={handleFileSelect}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              accept=".pdf,.xlsx,.xls"
              multiple
              disabled={uploading}
            />
            <div className="flex flex-col items-center gap-2">
              {getUploadStatus()}
              {!uploading && (
                <p>Arraste e solte os arquivos aqui ou clique para selecionar.</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center gap-2">
              <FileType className={files.pdf ? "text-green-500" : "text-gray-300"} />
              <span className="text-sm">
                PDF: {files.pdf ? files.pdf.name : "Não selecionado"}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <FileType className={files.xlsx ? "text-green-500" : "text-gray-300"} />
              <span className="text-sm">
                Excel: {files.xlsx ? files.xlsx.name : "Não selecionado"}
              </span>
            </div>
          </div>

          <button
            onClick={processFiles}
            disabled={uploading || !files.pdf || !files.xlsx}
            className="w-full py-2 px-4 bg-primary text-white rounded-md hover:bg-primary/90 disabled:opacity-50"
          >
            {uploading ? "Processando..." : "Processar Arquivos"}
          </button>
        </div>
      </CardContent>
    </Card>
  );
};

export default FileUpload;
