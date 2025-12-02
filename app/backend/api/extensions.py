from flask_sqlalchemy import SQLAlchemy
from flask_bcrypt import Bcrypt
from flask_jwt_extended import JWTManager
try:
    from flask_socketio import SocketIO
except ImportError:
    print("WARNING: Flask-SocketIO not available. Install with: pip install flask-socketio")
    SocketIO = None

db = SQLAlchemy()
bcrypt = Bcrypt()
jwt = JWTManager()
socketio = SocketIO() if SocketIO else None
