# admin.py - estatísticas simples e ferramentas de moderação
from flask import Blueprint, jsonify
from models import User, Produto, Post
from extensions import db

bp = Blueprint("admin", __name__)

@bp.route("/admin/stats", methods=["GET"])
def stats():
    return jsonify({
        "usuarios": User.query.count(),
        "produtos": Produto.query.count(),
        "posts": Post.query.count()
    })
