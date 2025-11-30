# backend/api/utils/jwt_utils.py
import jwt
from datetime import datetime, timedelta
from config import Config

def create_token(user_id):
    payload = {"user_id": user_id, "exp": datetime.utcnow() + timedelta(days=7), "iat": datetime.utcnow()}
    return jwt.encode(payload, Config.JWT_SECRET, algorithm="HS256")

def decode_jwt(token):
    try:
        return jwt.decode(token, Config.JWT_SECRET, algorithms=["HS256"])
    except jwt.ExpiredSignatureError:
        return None
    except jwt.InvalidTokenError:
        return None

# aliases for compatibility
create_jwt = create_token
decode_token = decode_jwt
