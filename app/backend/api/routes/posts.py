# backend/api/routes/posts.py
from flask import Blueprint, jsonify, request
from extensions import db
from models import Post, User, Like, Comment, Report
from utils.jwt_utils import decode_jwt
from utils.moderation import conteudo_aprovado

bp = Blueprint("posts", __name__)

def get_current_user_from_header(req):
    auth = req.headers.get("Authorization","")
    token = auth.replace("Bearer ","")
    if not token:
        return None
    payload = decode_jwt(token)
    if not payload:
        return None
    return User.query.get(payload.get("user_id"))

@bp.route("/posts", methods=["GET"])
def list_posts():
    posts = Post.query.order_by(Post.created_at.desc()).all()
    result = []
    for p in posts:
        author = p.autor
        post_dict = p.to_dict()
        post_dict["author"] = {"id": author.id, "username": author.username, "name": author.nome, "avatar": author.avatar}
        result.append(post_dict)
    return jsonify(result)

@bp.route("/posts", methods=["POST"])
def create_post():
    user = get_current_user_from_header(request)
    if not user:
        return jsonify({"error": "not authenticated"}), 401

    data = request.get_json() or {}
    tipo = data.get("tipo", "social")
    conteudo = data.get("conteudo")
    imagem = data.get("imagem")

    if tipo == "social" and not conteudo:
        return jsonify({"error": "Conteúdo é obrigatório"}), 400
    if tipo == "product" and not (data.get("titulo") and data.get("descricao")):
        return jsonify({"error": "Título e descrição são obrigatórios para produtos"}), 400

    if conteudo and not conteudo_aprovado(conteudo):
        return jsonify({"error": "Conteúdo contém palavras proibidas"}), 400

    new_post = Post(
        tipo=tipo,
        conteudo=conteudo,
        imagem=imagem,
        autor_id=user.id,
        titulo=data.get("titulo"),
        descricao=data.get("descricao"),
        preco=data.get("preco"),
        categoria=data.get("categoria"),
        file_path=data.get("file_path")
    )
    db.session.add(new_post)
    db.session.commit()

    return jsonify({"msg": "Post criado", "post": new_post.to_dict() | {
        "author": {"id": user.id, "username": user.username, "name": user.nome, "avatar": user.avatar}
    }}), 201

@bp.route("/posts/user/<int:user_id>", methods=["GET"])
def get_user_posts(user_id):
    posts = Post.query.filter_by(autor_id=user_id).order_by(Post.created_at.desc()).all()
    result = []
    for p in posts:
        author = p.autor
        post_dict = p.to_dict()
        post_dict["author"] = {"id": author.id, "username": author.username, "name": author.nome, "avatar": author.avatar}
        result.append(post_dict)
    return jsonify(result)

@bp.route("/posts/<int:post_id>", methods=["DELETE"])
def delete_post(post_id):
    user = get_current_user_from_header(request)
    if not user:
        return jsonify({"error": "not authenticated"}), 401

    post = Post.query.get_or_404(post_id)
    if post.autor_id != user.id:
        return jsonify({"error": "not authorized"}), 403

    db.session.delete(post)
    db.session.commit()
    return jsonify({"msg": "Post deletado"}), 200

@bp.route("/posts/<int:post_id>/like", methods=["POST"])
def like_post(post_id):
    user = get_current_user_from_header(request)
    if not user:
        return jsonify({"error": "not authenticated"}), 401

    post = Post.query.get_or_404(post_id)

    existing_like = Like.query.filter_by(user_id=user.id, post_id=post_id).first()

    if existing_like:
        db.session.delete(existing_like)
        db.session.commit()
        return jsonify({"msg": "Descurtido", "liked": False}), 200
    else:
        new_like = Like(user_id=user.id, post_id=post_id)
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
        user = get_current_user_from_header(request)
        if not user:
            return jsonify({"error": "not authenticated"}), 401

        data = request.get_json() or {}
        conteudo = data.get("conteudo")

        if not conteudo:
            return jsonify({"error": "Conteúdo do comentário é obrigatório"}), 400

        if not conteudo_aprovado(conteudo):
            return jsonify({"error": "Conteúdo contém palavras proibidas"}), 400

        new_comment = Comment(user_id=user.id, post_id=post_id, conteudo=conteudo)
        db.session.add(new_comment)
        db.session.commit()
        return jsonify({"msg": "Comentário adicionado", "comment": new_comment.to_dict()}), 201

@bp.route("/posts/<int:post_id>/report", methods=["POST"])
def report_post(post_id):
    user = get_current_user_from_header(request)
    if not user:
        return jsonify({"error": "not authenticated"}), 401

    data = request.get_json() or {}
    motivo = data.get("motivo")

    if not motivo:
        return jsonify({"error": "Motivo do reporte é obrigatório"}), 400

    report = Report(user_id=user.id, post_id=post_id, motivo=motivo)
    db.session.add(report)
    db.session.commit()

    return jsonify({"msg": "Post reportado para revisão"}), 201
