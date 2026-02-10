import sys
import os
from dotenv import load_dotenv

# Agregar la ruta de GameReqsAPI al path de Python
api_path = os.path.join(os.path.dirname(__file__), 'GameReqsAPI-master', 'GameReqsAPI-master')
sys.path.insert(0, api_path)

# Cambiar al directorio de la API para que encuentre la base de datos
os.chdir(api_path)

# Cargar variables de entorno desde .env
env_path = os.path.join(api_path, '.env')
load_dotenv(env_path)

# Verificar que la clave API esté configurada
api_key = os.getenv('API_KEY')
if api_key:
    print(f"API Key configurada: {api_key[:5]}...")
else:
    print("ADVERTENCIA: No se encontró API_KEY en .env")

from api import create_app

if __name__ == '__main__':
    print("=" * 60)
    print("  GameReqsAPI - Sistema de Requisitos de Juegos")
    print("=" * 60)
    print("")
    print("  Servidor iniciado en: http://localhost:5000")
    print("  Endpoint principal:   http://localhost:5000/api/v1/games")
    print("")
    print("  Presiona Ctrl+C para detener el servidor")
    print("=" * 60)
    print("")
    
    app = create_app()
    app.run(host='127.0.0.1', port=5000, debug=False)
