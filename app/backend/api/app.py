# app.py - arquivo principal que inicializa a aplicação Flask
# Rode este arquivo ao entrar na pasta backend/api e executar: flask run --debug
from flask import Flask, jsonify
from flask_cors import CORS
from extensions import db
from config import Config
import os

def create_app():
    app = Flask(__name__, static_folder=None)
    # Carrega config da classe Config
    app.config.from_object(Config)
    CORS(app)

    # inicializa db
    db.init_app(app)

    # cria uploads folder se não existir
    os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)

    # registra blueprints (rotas)
    from routes.auth import bp as auth_bp
    from routes.produtos import bp as produtos_bp
    from routes.posts import bp as posts_bp
    from routes.chat import bp as chat_bp
    from routes.search import bp as search_bp
    from routes.uploads import bp as uploads_bp
    from routes.gamification import bp as gamification_bp
    from routes.admin import bp as admin_bp
    from routes.user import bp as user_bp

    app.register_blueprint(auth_bp, url_prefix="/api")
    app.register_blueprint(produtos_bp, url_prefix="/api")
    app.register_blueprint(posts_bp, url_prefix="/api")
    app.register_blueprint(chat_bp, url_prefix="/api")
    app.register_blueprint(search_bp, url_prefix="/api")
    app.register_blueprint(uploads_bp, url_prefix="/api")
    app.register_blueprint(gamification_bp, url_prefix="/api")
    app.register_blueprint(admin_bp, url_prefix="/api")
    app.register_blueprint(user_bp, url_prefix="/api")


    # cria as tabelas se não existirem (útil em dev)
    with app.app_context():
        db.create_all()

    # rota simples de sanity
    @app.route("/api/ping")
    def ping():
        return jsonify({"pong": True})

    return app

# entrypoint para flask run
app = create_app()
