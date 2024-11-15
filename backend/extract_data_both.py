# C:\Users\fagun\OneDrive\Desktop\indicadores-upa\scripts\extract_data_both.py

import pandas as pd
import PyPDF2
import re
import os
from datetime import datetime
import json
import logging
import traceback

# Configure o logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)

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
    
    # Verifica campos obrigatórios
    for field in required_fields:
        if field not in data_dict:
            data_dict[field] = 'NÃO INFORMADO'
    
    # Limpa e padroniza os dados
    data_dict['Nome'] = data_dict['Nome'].strip() if data_dict['Nome'] else 'NÃO INFORMADO'
    data_dict['Hospital'] = data_dict['Hospital'].strip() if data_dict['Hospital'] else 'NÃO INFORMADO'
    data_dict['Status'] = data_dict['Status'].strip() if data_dict['Status'] else 'NÃO INFORMADO'
    data_dict['Setor'] = data_dict['Setor'].strip() if data_dict['Setor'] else 'NÃO INFORMADO'
    
    # Valida datas
    data_dict['Data_Entrada'] = validate_date(data_dict['Data_Entrada'])
    data_dict['Data_Saida'] = validate_date(data_dict['Data_Saida'])
    
    return data_dict

def padronizar_dados(dados):
    """Padroniza a estrutura dos dados independente da fonte"""
    campos_padrao = {
        'Nome': 'NÃO INFORMADO',
        'Data_Entrada': 'NÃO INFORMADO',
        'Data_Saida': 'NÃO INFORMADO',
        'Hospital': 'NÃO INFORMADO',
        'Status': 'NÃO INFORMADO',
        'Setor': 'NÃO INFORMADO'
    }
    
    if isinstance(dados, dict):
        return {**campos_padrao, **{k: v for k, v in dados.items() if k in campos_padrao}}
    return dados

def extract_from_pdf(file_path):
    """Extrai dados do arquivo PDF"""
    try:
        logging.info(f"Iniciando extração do PDF: {file_path}")
        with open(file_path, 'rb') as file:
            reader = PyPDF2.PdfReader(file)
            text = ""
            for page in reader.pages:
                text += page.extract_text()
            
            # Divide o texto em registros
            records = re.split(r'(?=(?:R E M|C T I|S P)\s+)', text)
            
            data = []
            for record in records:
                if not record.strip():
                    continue
                
                # Extrai tipo (R E M, C T I, S P)
                tipo_match = re.match(r'(R E M|C T I|S P)\s+', record)
                if not tipo_match:
                    continue
                    
                tipo = tipo_match.group(1)
                rest = record[len(tipo_match.group(0)):]
                
                # Extrai nome e local
                nome_local_match = re.match(r'([A-ZÀ-Ú\s\']+?)\s+(PS[12]|BOX[-\d]+|ISOL\s*\d+/\d+|em casa)', rest)
                if not nome_local_match:
                    continue
                    
                nome = nome_local_match.group(1).strip()
                local = nome_local_match.group(2).strip()
                
                # Extrai diagnóstico (tudo até encontrar um número ou hospital)
                diagnostico_match = re.search(r'(?:PS[12]|BOX[-\d]+|ISOL\s*\d+/\d+|em casa)\s+([^0-9]+?)(?=\d|HOSPITAL|SANTA)', rest)
                diagnostico = diagnostico_match.group(1).strip() if diagnostico_match else "NÃO INFORMADO"
                
                # Extrai hospital/destino
                hospital_match = re.search(r'(SANTA CASA[^\.]+?|HOSPITAL[^\.]+?)(?=\d|DIVINÓPOLIS)', rest)
                hospital = hospital_match.group(1).strip() if hospital_match else "NÃO INFORMADO"
                
                # Extrai cidade
                cidade_match = re.search(r'(DIVINÓPOLIS|SÃO GONCALO|PERDIGAO|ARAUJOS)', rest)
                cidade = cidade_match.group(1) if cidade_match else "NÃO INFORMADO"
                
                # Extrai número SUS
                sus_match = re.search(r'(\d{9})', rest)
                sus = sus_match.group(1) if sus_match else "NÃO INFORMADO"
                
                # Extrai datas
                datas = re.findall(r'(\d{2}/\d{2}/\d{4})', rest)
                data_entrada = validate_date(datas[0] if datas else "NÃO INFORMADO")
                data_saida = validate_date(datas[-1] if len(datas) > 1 else data_entrada)
                
                # Extrai setor e status
                setor_match = re.search(r'(Observação|Pediatria|Emergência|Isolamento)', rest)
                setor = setor_match.group(1) if setor_match else "NÃO INFORMADO"
                
                status_match = re.search(r'(ALTA|ÓBITO|INTERNAÇÃO HOSPITAL|TRANSFERÊNCIA SEM RE|COMPRA DE LEITO|LAUDO CANCELADO|EVASÃO)', rest)
                status = status_match.group(1).strip() if status_match else "NÃO INFORMADO"
                
                registro = validate_and_clean_data({
                    'Tipo': tipo.strip(),
                    'Nome': nome.strip(),
                    'Local': local.strip(),
                    'Diagnostico': diagnostico.strip(),
                    'Hospital': hospital.strip(),
                    'Cidade': cidade.strip(),
                    'SUS': sus.strip(),
                    'Setor': setor.strip(),
                    'Data_Entrada': data_entrada,
                    'Data_Saida': data_saida,
                    'Status': status.strip()
                })
                
                data.append(registro)
            
            df = pd.DataFrame(data)
            
            # Limpa e padroniza diagnósticos
            df['Diagnostico'] = df['Diagnostico'].apply(lambda x: re.sub(r'\s+', ' ', x))
            
            print("\nDados extraídos do PDF:")
            print(f"Total de registros: {len(df)}")
            print("\nDistribuição por tipo:")
            print(df['Tipo'].value_counts().to_string())
            print("\nDistribuição por status:")
            print(df['Status'].value_counts().to_string())
            print("\nPrimeiros 3 registros completos:")
            print(df.head(3).to_string())
            
            return df.to_json(orient='records', force_ascii=False)
            
    except Exception as e:
        logging.error(f"Erro ao processar PDF: {str(e)}")
        logging.debug(traceback.format_exc())
        return None

def extract_from_excel(file_path):
    """Extrai dados do arquivo Excel"""
    try:
        logging.info(f"Iniciando extração do Excel: {file_path}")
        df = pd.read_excel(file_path)
        
        # Mapeia as colunas
        column_mapping = {
            'Nº SUS Fácil': 'SUS',
            'Nome': 'Nome',
            'Data Entrada': 'Data_Entrada',
            'Data Saída': 'Data_Saida',
            'Destino': 'Hospital',
            'Fim': 'Status',
            'Clinica': 'Setor'
        }
        
        # Renomeia as colunas
        df = df.rename(columns=column_mapping)
        
        # Seleciona apenas as colunas necessárias
        required_columns = ['Nome', 'Data_Entrada', 'Data_Saida', 'Hospital', 'Status', 'Setor']
        df = df[required_columns]
        
        # Processamento dos dados
        df = df.dropna(how='all')
        df = df.dropna(subset=['Nome', 'Data_Entrada'])
        
        # Preenche valores nulos
        df['Hospital'] = df['Hospital'].fillna('NÃO INFORMADO')
        df['Status'] = df['Status'].fillna('EM ATENDIMENTO')
        df['Setor'] = df['Setor'].fillna('NÃO INFORMADO')
        
        # Formata as datas
        df['Data_Entrada'] = pd.to_datetime(df['Data_Entrada']).dt.strftime('%d/%m/%Y')
        df['Data_Saida'] = df['Data_Saida'].fillna('EM ATENDIMENTO')
        df.loc[df['Data_Saida'] != 'EM ATENDIMENTO', 'Data_Saida'] = pd.to_datetime(
            df.loc[df['Data_Saida'] != 'EM ATENDIMENTO', 'Data_Saida']
        ).dt.strftime('%d/%m/%Y')
        
        print("\nDados extraídos do Excel:")
        print(f"Total de registros: {len(df)}")
        print("\nPrimeiros registros:")
        print(df.head().to_string())
        
        return df.to_json(orient='records', force_ascii=False)
        
    except Exception as e:
        logging.error(f"Erro ao processar Excel: {str(e)}")
        logging.debug(traceback.format_exc())
        return None

def process_files(input_dir, output_dir):
    """Processa os arquivos e gera relatórios"""
    timestamp = datetime.now().strftime("%Y%m%d_%H%M")
    
    for filename in os.listdir(input_dir):
        file_path = os.path.join(input_dir, filename)
        
        if filename.endswith('.xlsx'):
            print(f"\nProcessando Excel: {filename}")
            excel_json = extract_from_excel(file_path)
            if excel_json is not None:
                output = os.path.join(output_dir, f'dados_excel_{timestamp}.json')
                with open(output, 'w', encoding='utf-8') as f:
                    json.dump(json.loads(excel_json), f, ensure_ascii=False, indent=4)
                print(f"Excel salvo em: {output}")
                
        elif filename.endswith('.pdf'):
            print(f"\nProcessando PDF: {filename}")
            pdf_json = extract_from_pdf(file_path)
            if pdf_json is not None:
                output = os.path.join(output_dir, f'dados_pdf_{timestamp}.json')
                with open(output, 'w', encoding='utf-8') as f:
                    json.dump(json.loads(pdf_json), f, ensure_ascii=False, indent=4)
                print(f"PDF salvo em: {output}")
                
                # Converte o JSON de volta para DataFrame para gerar estatísticas
                pdf_df = pd.read_json(pdf_json)
                
                # Gera estatísticas detalhadas do PDF
                stats_output = os.path.join(output_dir, f'estatisticas_pdf_{timestamp}.txt')
                with open(stats_output, 'w', encoding='utf-8') as f:
                    f.write("ESTATÍSTICAS DETALHADAS\n")
                    f.write("=" * 50 + "\n\n")
                    
                    f.write("1. DISTRIBUIÇÃO POR TIPO DE ATENDIMENTO\n")
                    f.write(pdf_df['Tipo'].value_counts().to_string() + "\n\n")
                    
                    f.write("2. DISTRIBUIÇÃO POR STATUS\n")
                    f.write(pdf_df['Status'].value_counts().to_string() + "\n\n")
                    
                    f.write("3. DISTRIBUIÇÃO POR SETOR\n")
                    f.write(pdf_df['Setor'].value_counts().to_string() + "\n\n")
                    
                    f.write("4. DISTRIBUIÇÃO POR CIDADE\n")
                    f.write(pdf_df['Cidade'].value_counts().to_string() + "\n\n")
                    
                    f.write("5. HOSPITAIS DE DESTINO\n")
                    f.write(pdf_df['Hospital'].value_counts().to_string() + "\n")
                
                print(f"Estatísticas salvas em: {stats_output}")

if __name__ == "__main__":
    print("Iniciando processamento...")
    input_dir = r"C:\Users\fagun\OneDrive\Desktop\indicadores-upa\inputs"
    output_dir = r"C:\Users\fagun\OneDrive\Desktop\indicadores-upa\outputs"
    
    process_files(input_dir, output_dir)
    print("\nProcessamento concluído!")
