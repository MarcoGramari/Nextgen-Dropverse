# app.py - arquivo principal que inicializa a aplicação Flask
# Rode este arquivo ao entrar na pasta backend/api e executar: flask run --debug
from flask import Flask, jsonify
from flask_cors import CORS
from extensions import db, socketio
from config import Config
import os

def create_app():
    app = Flask(__name__, static_folder=None)
    # Carrega config da classe Config
    app.config.from_object(Config)
    CORS(app)

    # inicializa db e socketio
    db.init_app(app)
    if socketio:
        socketio.init_app(app, cors_allowed_origins="*", message_queue=None) # message_queue=None para ambiente de desenvolvimento simples

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


# Adicionar eventos de SocketIO (exemplo) - only if socketio is available
if socketio:
    @socketio.on("connect")
    def handle_connect():
        print("Cliente conectado")

    @socketio.on("disconnect")
    def handle_disconnect():
        print("Cliente desconectado")

    @socketio.on("send_message")
    def handle_send_message(data):
        # Lógica para processar a mensagem e emitir para o destinatário
        print("Mensagem recebida:", data)
        socketio.emit("new_message", data, room=data.get("room")) # Exemplo de emissão para uma sala

# entrypoint para flask run
app = create_app()

# Para rodar com SocketIO: socketio.run(app, port=5001)
# O comando "flask run" não funcionará mais diretamente com SocketIO.
# Vamos modificar o entrypoint para usar o comando "python app.py"
if __name__ == "__main__":
    if socketio:
        socketio.run(app, port=5000)
    else:
        app.run(port=5000, debug=True)
