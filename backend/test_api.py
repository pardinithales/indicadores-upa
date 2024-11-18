import asyncio
import sys
import os
import json
import logging
from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import uvicorn
from typing import List
from contextlib import asynccontextmanager
from datetime import datetime
import pandas as pd
from PyPDF2 import PdfReader
import re
import tempfile

# Configuração do loop de eventos no Windows
if sys.platform.startswith('win'):
    asyncio.set_event_loop_policy(asyncio.WindowsSelectorEventLoopPolicy())

# Configuração do logging
logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s")
logger = logging.getLogger(__name__)

app = FastAPI()

# Configuração CORS
origins = [
    "https://indicadores-upa-frontend-ewjltshuw-thales-pardinis-projects.vercel.app",
    "http://localhost:3000",  # Para desenvolvimento local
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Funções auxiliares para validação e extração de dados
def validate_date(date_str):
    """Valida e padroniza formato de data"""
    if not date_str or date_str == "NÃO INFORMADO" or date_str == "EM ATENDIMENTO":
        return "EM ATENDIMENTO"
    try:
        date_obj = datetime.strptime(date_str, '%d/%m/%Y')
        return date_obj.strftime('%d/%m/%Y')
    except ValueError:
        return "EM ATENDIMENTO"

def validate_and_clean_data(data_dict):
    """Valida e limpa os dados antes de retornar"""
    required_fields = ['Nome', 'Data_Entrada', 'Data_Saida', 'Hospital', 'Status', 'Setor']
    for field in required_fields:
        if field not in data_dict:
            data_dict[field] = 'NÃO INFORMADO'
    return data_dict

def extract_from_pdf(file_path):
    """Extrai dados do arquivo PDF"""
    try:
        with open(file_path, 'rb') as file:
            reader = PdfReader(file)
            text = ""
            for page in reader.pages:
                text += page.extract_text()
            records = re.split(r'(?=(?:R E M|C T I|S P)\s+)', text)
            data = []
            for record in records:
                if not record.strip():
                    continue
                tipo_match = re.match(r'(R E M|C T I|S P)\s+', record)
                if not tipo_match:
                    continue
                tipo = tipo_match.group(1)
                rest = record[len(tipo_match.group(0)):]
                nome_match = re.search(r'([A-ZÀ-Ú\s\']+?)\s+(PS|BOX|ISOL|em casa)', rest)
                nome = nome_match.group(1).strip() if nome_match else "NÃO INFORMADO"
                data.append(validate_and_clean_data({"Nome": nome, "Tipo": tipo.strip()}))
            return json.dumps(data, ensure_ascii=False)
    except Exception as e:
        logger.error(f"Erro ao processar PDF: {e}")
        return None

def extract_from_excel(file_path):
    """Extrai dados do arquivo Excel"""
    try:
        df = pd.read_excel(file_path)
        column_mapping = {
            'Nome': 'Nome',
            'Data Entrada': 'Data_Entrada',
            'Data Saída': 'Data_Saida',
            'Destino': 'Hospital',
            'Fim': 'Status',
            'Clinica': 'Setor'
        }
        df = df.rename(columns=column_mapping)
        return df.to_json(orient='records', force_ascii=False)
    except Exception as e:
        logger.error(f"Erro ao processar Excel: {e}")
        return None

@asynccontextmanager
async def managed_file_upload(file: UploadFile, timeout=30):
    """Gerencia o ciclo de vida do arquivo temporário com timeout"""
    temp_file = f"temp_{file.filename}"
    try:
        content = await asyncio.wait_for(file.read(), timeout=timeout)
        with open(temp_file, "wb") as f:
            f.write(content)
        yield temp_file
    except asyncio.TimeoutError:
        logger.error(f"Timeout ao processar arquivo {file.filename}")
        raise HTTPException(status_code=408, detail="Timeout ao processar arquivo")
    except Exception as e:
        logger.error(f"Erro ao processar arquivo {file.filename}: {e}")
        raise HTTPException(status_code=500, detail="Erro ao processar arquivo")
    finally:
        if os.path.exists(temp_file):
            os.remove(temp_file)

@app.post("/test-upload/")
async def test_upload(files: List[UploadFile] = File(...)):
    results = []
    try:
        # Diretório temporário
        temp_dir = "/tmp" if os.path.exists("/tmp") else tempfile.gettempdir()

        for file in files:
            temp_file_path = os.path.join(temp_dir, file.filename)
            with open(temp_file_path, "wb") as temp_file:
                temp_file.write(await file.read())

            # Processa o arquivo dependendo do tipo
            if file.filename.endswith(".pdf"):
                pdf_data = extract_from_pdf(temp_file_path)
                if pdf_data:
                    results.append({"filename": file.filename, "type": "pdf", "data": json.loads(pdf_data)})
            elif file.filename.endswith((".xlsx", ".xls")):
                excel_data = extract_from_excel(temp_file_path)
                if excel_data:
                    results.append({"filename": file.filename, "type": "excel", "data": json.loads(excel_data)})

            # Remova o arquivo temporário após o processamento
            os.remove(temp_file_path)

        return {"status": "success", "data": results}
    except Exception as e:
        logger.error(f"Erro ao processar arquivos: {e}")
        raise HTTPException(status_code=500, detail=f"Erro ao processar arquivos: {str(e)}")



@app.get("/")
async def read_root():
    return {"message": "API está funcionando"}

@app.on_event("startup")
async def startup_event():
    """Processa os arquivos iniciais na pasta inputs quando o servidor inicia"""
    logger.info("Iniciando processamento inicial dos arquivos")
    input_dir = os.path.join(os.path.dirname(__file__), '..', 'inputs')
    output_dir = os.path.join(os.path.dirname(__file__), '..', 'outputs')

    if not os.path.exists(input_dir):
        logger.error(f"Diretório de inputs não encontrado: {input_dir}")
        return

    all_data = []
    for filename in os.listdir(input_dir):
        file_path = os.path.join(input_dir, filename)
        if filename.endswith(".pdf"):
            pdf_result = extract_from_pdf(file_path)
            if pdf_result:
                all_data.extend(json.loads(pdf_result))
        elif filename.endswith((".xlsx", ".xls")):
            excel_result = extract_from_excel(file_path)
            if excel_result:
                all_data.extend(json.loads(excel_result))

    if all_data:
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        output_file = os.path.join(output_dir, f"merged_data_{timestamp}.json")
        os.makedirs(output_dir, exist_ok=True)
        with open(output_file, "w", encoding="utf-8") as f:
            json.dump(all_data, f, ensure_ascii=False, indent=2)
