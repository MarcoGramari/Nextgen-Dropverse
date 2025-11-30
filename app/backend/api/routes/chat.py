# chat.py - chat simples com mensagens persistentes e temporárias
from flask import Blueprint, request, jsonify
from extensions import db
from models import Chat, Message
from datetime import datetime, timedelta

bp = Blueprint("chat", __name__)

@bp.route("/chat/iniciar", methods=["POST"])
def iniciar_chat():
    data = request.get_json() or {}
    user1 = data.get("user1_id")
    user2 = data.get("user2_id")
    is_temp = bool(data.get("is_temp", False))
    chat = Chat(participant_a=user1, participant_b=user2, is_temp=is_temp)
    db.session.add(chat)
    db.session.commit()
    return jsonify({"chat_id": chat.id})

@bp.route("/chat/mensagem", methods=["POST"])
def enviar_mensagem():
    data = request.get_json() or {}
    chat_id = data.get("chat_id")
    remetente_id = data.get("remetente_id")
    conteudo = data.get("conteudo")
    imagem = data.get("imagem")

    msg = Message(chat_id=chat_id, remetente_id=remetente_id, conteudo=conteudo, imagem=imagem)
    chat = Chat.query.get(chat_id)
    chat.last_activity = datetime.utcnow()
    db.session.add(msg)
    db.session.commit()
    return jsonify({"msg": "Mensagem enviada"})

@bp.route("/chat/<int:chat_id>", methods=["GET"])
def listar_mensagens(chat_id):
    msgs = Message.query.filter_by(chat_id=chat_id).order_by(Message.data_envio.asc()).all()
    return jsonify([m.to_dict() for m in msgs])

@bp.route("/chat/limpar_temporarios", methods=["DELETE"])
def limpar_chats_temporarios():
    limite = datetime.utcnow() - timedelta(hours=48)
    antigos = Chat.query.filter(Chat.is_temp == True, Chat.last_activity < limite).all()
    for c in antigos:
        Message.query.filter_by(chat_id=c.id).delete()
        db.session.delete(c)
    db.session.commit()
    return jsonify({"msg": "Chats temporários removidos"})
