# backend/api/routes/posts.py
from flask import Blueprint, jsonify
from extensions import db
from models import Post, User

bp = Blueprint("posts", __name__)

@bp.route("/posts", methods=["GET"])
def list_posts():
    posts = Post.query.order_by(Post.created_at.desc()).all()
    result = []
    for p in posts:
        author = p.autor
        result.append({
            "id": p.id,
            "content": p.conteudo,
            "image": p.imagem,
            "likes": p.likes,
            "created_at": p.created_at.isoformat(),
            "author": {"id": author.id, "username": author.username, "name": author.nome, "avatar": author.avatar}
        })
    return jsonify(result)
