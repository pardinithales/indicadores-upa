import pandas as pd
import os
from datetime import datetime

def create_test_data():
    # Cria a pasta inputs se não existir
    if not os.path.exists('inputs'):
        os.makedirs('inputs')
        print("Pasta 'inputs' criada")

    # Dados de teste mais completos
    test_data = {
        'Nome': [
            'João Silva',
            'Maria Santos',
            'Pedro Alves',
            'Ana Oliveira',
            'Carlos Lima'
        ],
        'Data_Entrada': [
            '11/11/2024',
            '11/11/2024',
            '11/11/2024',
            '11/11/2024',
            '11/11/2024'
        ],
        'Data_Saida': [
            '12/11/2024',
            '12/11/2024',
            '12/11/2024',
            '12/11/2024',
            '12/11/2024'
        ],
        'Hospital': [
            'Santa Casa',
            'Hospital Central',
            'NÃO INFORMADO',
            'Santa Casa',
            'Hospital Central'
        ],
        'Status': [
            'ALTA',
            'INTERNAÇÃO HOSPITAL',
            'TRANSFERÊNCIA SEM RE',
            'ALTA',
            'INTERNAÇÃO HOSPITAL'
        ],
        'Setor': [
            'Observação',
            'Emergência',
            'Pediatria',
            'Observação',
            'Isolamento'
        ]
    }

    # Cria DataFrame
    df = pd.DataFrame(test_data)
    
    # Salva em Excel
    file_path = os.path.join('inputs', 'test_data.xlsx')
    df.to_excel(file_path, index=False)
    print(f"Arquivo de teste criado: {file_path}")
    print("\nConteúdo do arquivo:")
    print(df.to_string())
    
    return file_path

if __name__ == "__main__":
    create_test_data() 