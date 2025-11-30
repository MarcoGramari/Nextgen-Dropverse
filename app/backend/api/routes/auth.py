# auth.py - rotas de autenticação (register, login, verify parental consent)
from flask import Blueprint, request, jsonify, current_app, url_for
from extensions import db
from models import User
from utils.jwt_utils import create_token
from utils.email_utils import send_email
from config import Config
from datetime import datetime

bp = Blueprint("auth", __name__)

@bp.route("/auth/register", methods=["POST"])
def register():
    """
    Registra um usuário. Se tiver parental_email, envia consentimento.
    Espera:
    {
      "nome", "username", "email", "password", "parental_email" (opcional)
    }
    """
    data = request.get_json() or {}
    nome = data.get("nome")
    username = data.get("username")
    email = data.get("email")
    password = data.get("password")
    parental = data.get("parental_email")

    if not (nome and username and email and password):
        return jsonify({"error": "Campos obrigatórios faltando"}), 400

    if User.query.filter((User.email == email) | (User.username == username)).first():
        return jsonify({"error": "Usuário já existe"}), 409

    user = User(nome=nome, username=username, email=email, parental_email=parental)
    user.set_password(password)
    db.session.add(user)
    db.session.commit()

    # se parental email fornecido, enviar link de consentimento
    if parental:
        # link de consentimento (ex: /api/auth/consent?user_id=... )
        consent_url = url_for("auth.parental_consent", user_id=user.id, _external=True)
        send_email(parental, "Consentimento Dropverse", f"Autorize a conta: {consent_url}")

    return jsonify({"msg": "Conta criada. Aguarde verificação se necessário."}), 201

@bp.route("/auth/login", methods=["POST"])
def login():
    """
    Login: espera {email, senha}. Retorna token JWT em caso de sucesso.
    """
    data = request.get_json() or {}
    email = data.get("email")
    senha = data.get("senha")
    if not (email and senha):
        return jsonify({"error": "Credenciais inválidas"}), 400

    user = User.query.filter_by(email=email).first()
    if not user or not user.check_password(senha):
        return jsonify({"error": "Credenciais inválidas"}), 401

    # optional: bloqueio se parental not consent and age < 18 (omitir aqui)
    token = create_token(user.id)
    return jsonify({"token": token, "user": user.to_dict()})


@bp.route("/auth/consent", methods=["GET"])
def parental_consent():
    """
    Endpoint simples que seria usado pelo responsável para aprovar.
    Ex.: /api/auth/consent?user_id=3
    (Registra data/hora/IP se necessário)
    """
    user_id = request.args.get("user_id")
    u = User.query.get(user_id)
    if not u:
        return "Usuário não encontrado", 404
    u.is_verified = True
    db.session.commit()
    # registra data/hora se desejar
    return "Consentimento registrado. Conta liberada."
