import pandas as pd
import os
from datetime import datetime

def padronizar_categorias(df):
    """Padroniza nomes de categorias similares"""
    
    # Mapeamento de clínicas similares
    mapa_clinicas = {
        'CLINICA CARDIOLOGICA': 'CARDIOLOGICA',
        'CIRURGICOS CARDIOLOGICA': 'CARDIOLOGICA',
        'CIRURGICOS VASCULAR': 'CIRURGIA VASCULAR',
        'CIRURGICOS NEUROCIRURGIA': 'NEUROLOGIA',
        'CLINICA NEFRO/UROLOGIA': 'UROLOGIA',
        'ORTOPEDICA PEDIATRICA': 'ORTOPÉDICA'
    }
    
    # Aplica o mapeamento
    df['Clinica'] = df['Clinica'].replace(mapa_clinicas)
    
    # Padroniza status de fim
    df['Fim'] = df['Fim'].replace({
        'REGULAÇÃO': 'TRANSFERÊNCIA SEM REGULAÇÃO',
        'TRANSFERENCIA VIA SAMU': 'TRANSFERÊNCIA VIA SAMU',
        'INTERNACAO HOSPITALAR': 'INTERNAÇÃO HOSPITALAR'
    })
    
    return df

def extract_from_excel(file_path):
    """Extrai dados do arquivo Excel (primeira aba apenas)"""
    try:
        # Lê o Excel
        df = pd.read_excel(file_path, sheet_name=0)
        print(f"\nColunas originais: {list(df.columns)}")
        
        # Remove a coluna 'Nº SUS Fácil' se existir
        if 'Nº SUS Fácil' in df.columns:
            df = df.drop('Nº SUS Fácil', axis=1)
        
        # Renomeia as colunas
        df.columns = ['Nome', 'Data Entrada', 'Data Saida', 'Destino', 'Fim', 'Clinica']
        
        # Remove linhas vazias
        df = df.dropna(how='all')
        df = df.dropna(subset=['Nome'])
        
        # Preenche valores vazios
        df['Destino'] = df['Destino'].fillna('NÃO INFORMADO')
        df['Data Saida'] = df['Data Saida'].fillna('EM ATENDIMENTO')
        df['Fim'] = df['Fim'].fillna('EM ATENDIMENTO')
        
        # Trata as datas
        df['Data Entrada'] = pd.to_datetime(df['Data Entrada'], errors='coerce')
        df['Data Entrada'] = df['Data Entrada'].dt.strftime('%d/%m/%Y')
        
        # Padroniza categorias
        df = padronizar_categorias(df)
        
        print("\nPrimeiras 5 linhas após processamento:")
        print(df.head())
        
        return df
        
    except Exception as e:
        print(f"Erro ao ler Excel {file_path}: {e}")
        import traceback
        print(traceback.format_exc())
        return None

def process_directory(input_dir, output_dir):
    """Processa todos os arquivos do diretório"""
    all_data = []
    
    for filename in os.listdir(input_dir):
        if filename.endswith('.xlsx'):
            print(f"\nProcessando arquivo: {filename}")
            file_path = os.path.join(input_dir, filename)
            df = extract_from_excel(file_path)
            if df is not None:
                all_data.append(df)
                print(f"Processado com sucesso! Total de registros: {len(df)}")
    
    if all_data:
        final_df = pd.concat(all_data, ignore_index=True)
        
        output_path = os.path.join(output_dir, f'dados_compilados_{datetime.now().strftime("%Y%m%d")}.csv')
        final_df.to_csv(output_path, index=False, encoding='utf-8-sig')
        print(f"\nArquivo salvo em: {output_path}")
        
        print("\nEstatísticas finais:")
        print(f"Total de registros: {len(final_df)}")
        
        print("\nDistribuição por clínica:")
        clinicas = final_df['Clinica'].value_counts()
        print(clinicas.to_string())
        
        print("\nDistribuição por fim:")
        fins = final_df['Fim'].value_counts()
        print(fins.to_string())
        
        print("\nDistribuição por hospital (top 10):")
        hospitais = final_df['Destino'].value_counts().head(10)
        print(hospitais.to_string())
        
        return final_df
    else:
        print("Nenhum dado foi extraído")
        return None

if __name__ == "__main__":
    print("Iniciando processamento...")
    input_dir = r"C:\Users\fagun\OneDrive\Desktop\indicadores-upa\inputs"
    output_dir = r"C:\Users\fagun\OneDrive\Desktop\indicadores-upa\outputs"
    
    df = process_directory(input_dir, output_dir)