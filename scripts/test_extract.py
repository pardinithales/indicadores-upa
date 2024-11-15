import pandas as pd
import json
from extract_data_both import extract_from_excel

def test_extraction():
    file_path = 'inputs/test_data.xlsx'
    print(f"Testando extração do arquivo: {file_path}")
    
    # Lê o arquivo original para comparação
    original_df = pd.read_excel(file_path)
    print("\nDados originais:")
    print(original_df.to_string())
    
    # Testa a extração
    json_data = extract_from_excel(file_path)
    
    if json_data:
        print("\nDados extraídos:")
        extracted_data = json.loads(json_data)
        for item in extracted_data:
            print("\nRegistro:")
            for key, value in item.items():
                print(f"{key}: {value}")
    else:
        print("Falha na extração dos dados")

if __name__ == "__main__":
    test_extraction() 