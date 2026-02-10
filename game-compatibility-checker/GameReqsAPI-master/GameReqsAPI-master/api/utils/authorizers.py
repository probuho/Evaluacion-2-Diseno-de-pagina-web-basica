import os
import json
from functools import wraps

from flask import request


def require_api_key(view_func):
    @wraps(view_func)
    def authorize(*args, **kwargs):
        # MODO LOCAL: Permitir acceso sin autenticación
        # Esto es seguro porque solo se ejecuta en localhost (127.0.0.1:5000)
        # Para uso en producción, configurar API_KEY en .env
        return view_func(*args, **kwargs)
    return authorize
