import pandas as pd

# Cria dados de teste
test_data = {
    'Nome': ['João Silva', 'Maria Santos', 'Pedro Alves'],
    'Data_Entrada': ['2024-11-01', '2024-11-02', '2024-11-03'],
    'Data_Saida': ['2024-11-02', '2024-11-03', '2024-11-04'],
    'Hospital': ['Santa Casa', 'Hospital Central', 'NÃO INFORMADO'],
    'Status': ['ALTA', 'INTERNAÇÃO HOSPITAL', 'TRANSFERÊNCIA SEM RE'],
    'Setor': ['Observação', 'Emergência', 'Pediatria']
}

# Cria DataFrame
df = pd.DataFrame(test_data)

# Salva em Excel
df.to_excel('test_data.xlsx', index=False)
print("Arquivo de teste criado: test_data.xlsx") 