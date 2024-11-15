import requests
import os

def test_upload():
    url = 'http://localhost:8001/test-upload/'
    file_path = 'inputs/test_data.xlsx'
    
    if not os.path.exists(file_path):
        print(f"Arquivo não encontrado: {file_path}")
        return
        
    print(f"Enviando arquivo: {file_path}")
    
    try:
        with open(file_path, 'rb') as f:
            files = {
                'files': ('test_data.xlsx', f, 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'),
                'files': ('test_data.pdf', open('inputs/test_data.pdf', 'rb'), 'application/pdf')
            }
            response = requests.post(url, files=files)
            
            print(f"\nStatus code: {response.status_code}")
            
            if response.status_code == 200:
                result = response.json()
                print("\nResposta do servidor:")
                print(f"Status: {result['status']}")
                if 'data' in result:
                    print(f"Registros processados: {len(result['data'])}")
            else:
                print(f"Erro: {response.text}")
                
    except requests.exceptions.ConnectionError:
        print("Erro: Não foi possível conectar ao servidor. Certifique-se que ele está rodando na porta 8001")
    except Exception as e:
        print(f"Erro: {str(e)}")

if __name__ == "__main__":
    test_upload() 