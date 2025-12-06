# app.py
from flask import Flask, jsonify, send_from_directory
from flask_cors import CORS
from extensions import db, socketio
from config import Config
import os
import importlib

def create_app():
    app = Flask(__name__, static_folder=None)
    app.config.from_object(Config)
    CORS(app)  # permite acesso em dev; ajuste em produção

    # inicializa db e socketio
    db.init_app(app)
    if socketio:
        socketio.init_app(app, cors_allowed_origins="*")

    # cria uploads folder se não existir
    os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)

    # registra blueprints com import seguro
    blueprints = [
        ("routes.auth", "bp"),
        ("routes.produtos", "bp"),
        ("routes.posts", "bp"),
        ("routes.chat", "bp"),
        ("routes.search", "bp"),
        ("routes.uploads", "bp"),
        ("routes.gamification", "bp"),
        ("routes.admin", "bp"),
        ("routes.user", "bp"),
    ]

    for module_path, bp_name in blueprints:
        try:
            module = importlib.import_module(module_path)
            bp = getattr(module, bp_name)
            app.register_blueprint(bp, url_prefix="/api")
        except Exception:
            # se não existir algum módulo/blueprint, não trava a app (útil em dev)
            print(f"Aviso: não foi possível registrar {module_path} — continue se for intencional.")

    @app.route("/uploads/<filename>")
    def uploaded_file(filename):
        return send_from_directory(app.config['UPLOAD_FOLDER'], filename)

    with app.app_context():
        db.create_all()

    @app.route("/api/ping")
    def ping():
        return jsonify({"pong": True})

    return app

app = create_app()

if __name__ == "__main__":
    if socketio:
        socketio.run(app, port=5000)
    else:
        app.run(port=5000, debug=True)
