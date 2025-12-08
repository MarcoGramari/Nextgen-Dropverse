# routes/posts.py
from flask import Blueprint, jsonify, request
from extensions import db
from models import Post, User, Like, Comment, Report
from utils.jwt_utils import decode_jwt
from utils.moderation import conteudo_aprovado
from sqlalchemy.exc import SQLAlchemyError

bp = Blueprint("posts", __name__)

def get_current_user_from_header(req):
    auth = req.headers.get("Authorization", "")
    token = auth.replace("Bearer ", "").strip()
    if not token:
        return None
    try:
        payload = decode_jwt(token)
    except Exception:
        return None
    if not payload:
        return None
    return User.query.get(payload.get("user_id"))

@bp.route("/posts", methods=["POST"])
def create_post():
    user = get_current_user_from_header(request)
    if not user:
        return jsonify({"error": "not authenticated"}), 401

    data = request.get_json(silent=True) or {}

    tipo = data.get("tipo", "social")
    conteudo = data.get("conteudo") or None
    imagem = data.get("imagem") or None

    # Validação social
    if tipo == "social" and not conteudo and not imagem:
        return jsonify({"error": "Post social precisa de texto ou imagem"}), 400

    if conteudo and not conteudo_aprovado(conteudo):
        return jsonify({"error": "Conteúdo contém palavras proibidas"}), 400

    # Validações para produto
    if tipo == "product":
        if not data.get("titulo") or not data.get("descricao"):
            return jsonify({"error": "Título e descrição são obrigatórios"}), 400
        if not data.get("file_path"):
            return jsonify({"error": "Arquivo do produto é obrigatório (file_path)"}), 400
        # valida preco: se presente, deve ser float
        preco = data.get("preco")
        if preco is not None:
            try:
                preco = float(preco)
            except (ValueError, TypeError):
                return jsonify({"error": "Preço inválido"}), 400
    else:
        preco = None

    post = Post(
        tipo=tipo,
        conteudo=conteudo,
        imagem=imagem,
        autor_id=user.id,
        titulo=data.get("titulo"),
        descricao=data.get("descricao"),
        preco=preco,
        categoria=data.get("categoria"),
        file_path=data.get("file_path")
    )

    try:
        db.session.add(post)
        db.session.commit()
    except SQLAlchemyError as e:
        db.session.rollback()
        return jsonify({"error": "Erro ao salvar post", "detail": str(e)}), 500

    return jsonify({
        "msg": "Post criado com sucesso",
        "post": post.to_dict(),
        "author": {
            "id": user.id,
            "username": user.username,
            "name": user.nome,
            "avatar": user.avatar
        }
    }), 201

@bp.route("/posts", methods=["GET"])
def get_posts():
    posts = Post.query.order_by(Post.created_at.desc()).all()
    # Filter out posts where content is the author's real name
    posts = [p for p in posts if not (p.conteudo and p.conteudo.strip() == p.autor.nome)]
    result = []

    for post in posts:
        post_dict = post.to_dict()

        if post.autor:
            post_dict["author"] = {
                "id": post.autor.id,
                "username": post.autor.username,
                "name": post.autor.nome,
                "avatar": post.autor.avatar
            }
        else:
            post_dict["author"] = None

        result.append(post_dict)

    return jsonify(result)




@bp.route("/posts/user/<int:user_id>", methods=["GET"])
def get_posts_by_user(user_id):
    posts = Post.query.filter_by(autor_id=user_id).order_by(Post.created_at.desc()).all()
    # Filter out posts where content is the author's real name
    posts = [p for p in posts if not (p.conteudo and p.conteudo.strip() == p.autor.nome)]
    result = []

    for post in posts:
        post_dict = post.to_dict()

        if post.autor:
            post_dict["author"] = {
                "id": post.autor.id,
                "username": post.autor.username,
                "name": post.autor.nome,
                "avatar": post.autor.avatar
            }
        else:
            post_dict["author"] = None

        result.append(post_dict)

    return jsonify(result)

@bp.route("/posts/<int:post_id>", methods=["DELETE"])
def delete_post(post_id):
    user = get_current_user_from_header(request)
    if not user:
        return jsonify({"error": "not authenticated"}), 401

    post = Post.query.get_or_404(post_id)

    # Check if user is the author
    if post.autor_id != user.id:
        return jsonify({"error": "not authorized"}), 403

    try:
        db.session.delete(post)
        db.session.commit()
    except SQLAlchemyError as e:
        db.session.rollback()
        return jsonify({"error": "Erro ao deletar post", "detail": str(e)}), 500

    return jsonify({"msg": "Post deleted"}), 200

@bp.route("/posts/<int:post_id>/like", methods=["POST"])
def like_post(post_id):
    user = get_current_user_from_header(request)
    if not user:
        return jsonify({"error": "not authenticated"}), 401

    post = Post.query.get_or_404(post_id)

    # Check if user already liked
    existing_like = Like.query.filter_by(user_id=user.id, post_id=post_id).first()
    if existing_like:
        return jsonify({"error": "Already liked"}), 400

    like = Like(user_id=user.id, post_id=post_id)
    try:
        db.session.add(like)
        db.session.commit()
    except SQLAlchemyError as e:
        db.session.rollback()
        return jsonify({"error": "Erro ao registrar like", "detail": str(e)}), 500

    # Conta likes atuais
    likes_count = Like.query.filter_by(post_id=post_id).count()
    return jsonify({"msg": "Post liked", "likes": likes_count}), 200

@bp.route("/posts/<int:post_id>/comments", methods=["GET"])
def get_comments(post_id):
    post = Post.query.get_or_404(post_id)
    comments = Comment.query.filter_by(post_id=post_id).order_by(Comment.created_at.asc()).all()
    return jsonify([c.to_dict() for c in comments])

@bp.route("/posts/<int:post_id>/comments", methods=["POST"])
def create_comment(post_id):
    user = get_current_user_from_header(request)
    if not user:
        return jsonify({"error": "not authenticated"}), 401

    post = Post.query.get_or_404(post_id)

    data = request.get_json(silent=True) or {}
    conteudo = data.get("conteudo", "").strip()
    if not conteudo:
        return jsonify({"error": "Conteúdo do comentário é obrigatório"}), 400

    if not conteudo_aprovado(conteudo):
        return jsonify({"error": "Conteúdo contém palavras proibidas"}), 400

    comment = Comment(user_id=user.id, post_id=post_id, conteudo=conteudo)
    try:
        db.session.add(comment)
        db.session.commit()
    except SQLAlchemyError as e:
        db.session.rollback()
        return jsonify({"error": "Erro ao salvar comentário", "detail": str(e)}), 500

    return jsonify({
        "msg": "Comentário criado com sucesso",
        "comment": comment.to_dict()
    }), 201

@bp.route("/posts/<int:post_id>/comments/<int:comment_id>", methods=["DELETE"])
def delete_comment(post_id, comment_id):
    user = get_current_user_from_header(request)
    if not user:
        return jsonify({"error": "not authenticated"}), 401

    comment = Comment.query.get_or_404(comment_id)

    # Check if comment belongs to the post
    if comment.post_id != post_id:
        return jsonify({"error": "Comment does not belong to this post"}), 400

    # Check if user is the author of the comment
    if comment.user_id != user.id:
        return jsonify({"error": "not authorized"}), 403

    try:
        db.session.delete(comment)
        db.session.commit()
    except SQLAlchemyError as e:
        db.session.rollback()
        return jsonify({"error": "Erro ao deletar comentário", "detail": str(e)}), 500

    return jsonify({"msg": "Comentário deletado com sucesso"}), 200
