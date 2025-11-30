# gamification.py - ranking, pontos e badges
from flask import Blueprint, jsonify
from models import User, Badge

bp = Blueprint("gamification", __name__)

@bp.route("/gamification/ranking", methods=["GET"])
def ranking():
    top = User.query.order_by(User.points.desc()).limit(10).all()
    return jsonify([{"username": u.username, "points": u.points} for u in top])

@bp.route("/gamification/badges/<int:user_id>", methods=["GET"])
def badges(user_id):
    u = User.query.get_or_404(user_id)
    return jsonify([{"id": b.id, "nome": b.nome, "descricao": b.descricao} for b in u.badges])
