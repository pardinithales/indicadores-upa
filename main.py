from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from typing import List
import os
import json
from datetime import datetime

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

@app.post("/upload/")
async def upload_files(files: List[UploadFile] = File(...)):
    try:
        all_data = []
        for file in files:
            # Salvar arquivo temporariamente
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            file_path = os.path.join(UPLOAD_DIR, f"{timestamp}_{file.filename}")
            
            with open(file_path, "wb") as buffer:
                content = await file.read()
                buffer.write(content)
            
            # Aqui você pode adicionar a lógica de processamento do PDF
            # Por enquanto, vamos retornar dados mockados
            mock_data = {
                "Nome": "Paciente Teste",
                "Setor": "Emergência",
                "Status": "Em Atendimento",
                "Data_Entrada": "01/03/2024",
                "Data_Saida": "",
                "Hospital": "Hospital Central"
            }
            
            all_data.append(mock_data)
            os.remove(file_path)  # Remove o arquivo temporário
            
        return {"status": "success", "data": all_data}
    
    except Exception as e:
        return {"status": "error", "message": str(e)}

@app.get("/")
async def read_root():
    return {"message": "API está funcionando"}