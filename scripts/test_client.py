import requests
import os

def test_upload():
    # URL do endpoint de teste
    url = 'http://localhost:8001/test-upload/'
    
    # Caminho para o arquivo de teste
    file_path = 'inputs/test_data.xlsx'
    
    if not os.path.exists(file_path):
        print(f"Arquivo não encontrado: {file_path}")
        return
    
    try:
        # Prepara o arquivo para upload
        files = [
            ('files', ('test_data.xlsx', open(file_path, 'rb'), 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')),
            ('files', ('test_data.pdf', open('inputs/test_data.pdf', 'rb'), 'application/pdf'))  # Supondo que haja um PDF para testar
        ]
        
        # Faz a requisição
        response = requests.post(url, files=files)
        
        # Verifica a resposta
        if response.status_code == 200:
            result = response.json()
            print("Resposta do servidor:")
            print(f"Status: {result['status']}")
            if 'data' in result:
                print(f"Número de registros: {len(result['data'])}")
                print("\nPrimeiro registro:")
                print(result['data'][0])
        else:
            print(f"Erro: {response.status_code}")
            print(response.text)
            
    except Exception as e:
        print(f"Erro ao fazer requisição: {str(e)}")

if __name__ == "__main__":
    test_upload() 