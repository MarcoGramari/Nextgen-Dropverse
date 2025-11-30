# search.py - busca unificada por produtos, usuários e posts
from flask import Blueprint, request, jsonify
from models import Produto, User, Post

bp = Blueprint("search", __name__)

@bp.route("/search", methods=["GET"])
def buscar():
    q = (request.args.get("q") or "").strip()
    if not q:
        return jsonify({"produtos": [], "usuarios": [], "posts": []})
    produtos = Produto.query.filter(Produto.titulo.ilike(f"%{q}%")).all()
    usuarios = User.query.filter(User.username.ilike(f"%{q}%")).all()
    posts = Post.query.filter(Post.conteudo.ilike(f"%{q}%")).all()
    return jsonify({
        "produtos": [p.to_dict() for p in produtos],
        "usuarios": [u.to_dict() for u in usuarios],
        "posts": [p.to_dict() for p in posts]
    })
