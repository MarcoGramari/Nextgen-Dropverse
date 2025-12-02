# backend/api/routes/posts.py
from flask import Blueprint, jsonify, request
from extensions import db
from models import Post, User, Like, Comment, Report

bp = Blueprint("posts", __name__)

from utils.moderation import conteudo_aprovado

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

@bp.route("/posts/<int:post_id>/like", methods=["POST"])
def like_post(post_id):
    # Simulação de autenticação: user_id=1
    user_id = 1 # DEVE SER SUBSTITUÍDO POR JWT
    
    post = Post.query.get_or_404(post_id)
    
    existing_like = Like.query.filter_by(user_id=user_id, post_id=post_id).first()
    
    if existing_like:
        db.session.delete(existing_like)
        db.session.commit()
        return jsonify({"msg": "Descurtido", "liked": False}), 200
    else:
        new_like = Like(user_id=user_id, post_id=post_id)
        db.session.add(new_like)
        db.session.commit()
        return jsonify({"msg": "Curtido", "liked": True}), 201

@bp.route("/posts/<int:post_id>/comments", methods=["GET", "POST"])
def post_comments(post_id):
    post = Post.query.get_or_404(post_id)
    
    if request.method == "GET":
        comments = Comment.query.filter_by(post_id=post_id).order_by(Comment.created_at.asc()).all()
        return jsonify([c.to_dict() for c in comments])
    
    if request.method == "POST":
        # Simulação de autenticação: user_id=1
        user_id = 1 # DEVE SER SUBSTITUÍDO POR JWT
        data = request.get_json() or {}
        conteudo = data.get("conteudo")
        
        if not conteudo:
            return jsonify({"error": "Conteúdo do comentário é obrigatório"}), 400
            
        if not conteudo_aprovado(conteudo):
            return jsonify({"error": "Conteúdo contém palavras proibidas"}), 400
            
        new_comment = Comment(user_id=user_id, post_id=post_id, conteudo=conteudo)
        db.session.add(new_comment)
        db.session.commit()
        return jsonify({"msg": "Comentário adicionado", "comment": new_comment.to_dict()}), 201

@bp.route("/posts/<int:post_id>/report", methods=["POST"])
def report_post(post_id):
    # Simulação de autenticação: user_id=1
    user_id = 1 # DEVE SER SUBSTITUÍDO POR JWT
    data = request.get_json() or {}
    motivo = data.get("motivo")
    
    if not motivo:
        return jsonify({"error": "Motivo do reporte é obrigatório"}), 400
        
    report = Report(user_id=user_id, post_id=post_id, motivo=motivo)
    db.session.add(report)
    db.session.commit()
    
    return jsonify({"msg": "Post reportado para revisão"}), 201
