# backend/api/routes/user.py
from flask import Blueprint, request, jsonify
from extensions import db
from models import User, Follow, Produto, Purchase, Like, Post
from utils.jwt_utils import decode_jwt
from config import Config
from sqlalchemy import func
from datetime import datetime, timedelta
import os

bp = Blueprint("user", __name__)

def get_current_user_from_header(req):
    auth = req.headers.get("Authorization","")
    token = auth.replace("Bearer ","")
    if not token:
        return None
    payload = decode_jwt(token)
    if not payload:
        return None
    return User.query.get(payload.get("user_id"))

@bp.route("/user/profile", methods=["GET"])
def get_profile():
    user = get_current_user_from_header(request)
    if not user:
        return jsonify({"error":"not authenticated"}), 401
    return jsonify({"user": user.to_dict()})

@bp.route("/user/update", methods=["PUT"])
def update_profile():
    user = get_current_user_from_header(request)
    if not user:
        return jsonify({"error":"not authenticated"}), 401
    data = request.json or {}
    user.nome = data.get("nome", user.nome)
    user.bio = data.get("bio", user.bio)
    user.avatar = data.get("avatar", user.avatar)
    db.session.commit()
    return jsonify({"message":"updated","user": user.to_dict()})

@bp.route("/user/follow/<username>", methods=["POST"])
def follow_user(username):
    user = get_current_user_from_header(request)
    if not user:
        return jsonify({"error":"not authenticated"}), 401

    target_user = User.query.filter_by(username=username).first_or_404()
    if user.id == target_user.id:
        return jsonify({"error":"cannot follow yourself"}), 400

    existing_follow = Follow.query.filter_by(follower_id=user.id, followed_id=target_user.id).first()
    if existing_follow:
        return jsonify({"error":"already following"}), 400

    follow = Follow(follower_id=user.id, followed_id=target_user.id)
    db.session.add(follow)
    db.session.commit()
    return jsonify({"message":"followed successfully"})

@bp.route("/user/unfollow/<username>", methods=["POST"])
def unfollow_user(username):
    user = get_current_user_from_header(request)
    if not user:
        return jsonify({"error":"not authenticated"}), 401

    target_user = User.query.filter_by(username=username).first_or_404()
    follow = Follow.query.filter_by(follower_id=user.id, followed_id=target_user.id).first()
    if not follow:
        return jsonify({"error":"not following"}), 400

    db.session.delete(follow)
    db.session.commit()
    return jsonify({"message":"unfollowed successfully"})

@bp.route("/user/<int:user_id>", methods=["GET"])
def get_user_profile(user_id):
    user = User.query.get_or_404(user_id)
    return jsonify({"user": user.to_dict()})

@bp.route("/user/<username>", methods=["GET"])
def get_user_profile_by_username(username):
    user = User.query.filter_by(username=username).first_or_404()
    return jsonify({"user": user.to_dict()})

@bp.route("/user/following", methods=["GET"])
def get_following():
    user = get_current_user_from_header(request)
    if not user:
        return jsonify({"error":"not authenticated"}), 401

    target_user_id = request.args.get('user_id', type=int)
    if target_user_id is None:
        target_user_id = user.id

    following = Follow.query.filter_by(follower_id=target_user_id).all()
    following_users = [User.query.get(f.followed_id).to_dict() for f in following]
    return jsonify({"following": following_users})

@bp.route("/user/followers", methods=["GET"])
def get_followers():
    user = get_current_user_from_header(request)
    if not user:
        return jsonify({"error":"not authenticated"}), 401

    target_user_id = request.args.get('user_id', type=int)
    if target_user_id is None:
        target_user_id = user.id

    followers = Follow.query.filter_by(followed_id=target_user_id).all()
    follower_users = [User.query.get(f.follower_id).to_dict() for f in followers]
    return jsonify({"followers": follower_users})

@bp.route("/user/dashboard", methods=["GET"])
def get_dashboard():
    user = get_current_user_from_header(request)
    if not user:
        return jsonify({"error": "not authenticated"}), 401

    # Determine user type
    has_products = Post.query.filter_by(autor_id=user.id, tipo="product").count() > 0
    has_purchases = Purchase.query.filter_by(comprador_id=user.id).count() > 0

    dashboard_data = {
        "user_type": "seller" if has_products else "buyer" if has_purchases else "general",
        "user": user.to_dict()
    }

    if has_products:  # Seller dashboard
        # Total sales
        total_vendas = Purchase.query.join(Post, Purchase.produto_id == Post.id).filter(Post.autor_id == user.id, Post.tipo == "product").count()

        # Total products
        total_produtos = Post.query.filter_by(autor_id=user.id, tipo="product").count()

        # Likes on posts this week
        semana_passada = datetime.utcnow() - timedelta(days=7)
        curtidas_semana = Like.query.join(Post, Like.post_id == Post.id).filter(Post.autor_id == user.id, Like.created_at >= semana_passada).count()

        # Top products by downloads
        produtos_mais_vistos = Post.query.filter_by(autor_id=user.id, tipo="product").order_by(Post.created_at.desc()).limit(5).all()

        # Sales by month (last 12 months)
        last_year = datetime.utcnow() - timedelta(days=365)
        vendas_por_mes = db.session.query(
            func.extract('month', Purchase.created_at).label('mes'),
            func.count(Purchase.id).label('vendas')
        ).join(Post, Purchase.produto_id == Post.id).filter(Post.autor_id == user.id, Post.tipo == "product", Purchase.created_at >= last_year).group_by(func.extract('month', Purchase.created_at)).all()

        vendas_por_mes_dict = {int(v.mes): v.vendas for v in vendas_por_mes}
        vendas_por_mes_list = [{"mes": month, "vendas": vendas_por_mes_dict.get(month, 0)} for month in range(1, 13)]

        # Recent sales history
        recent_sales = Purchase.query.join(Post, Purchase.produto_id == Post.id).filter(Post.autor_id == user.id, Post.tipo == "product").order_by(Purchase.created_at.desc()).limit(10).all()
        sales_history = []
        for sale in recent_sales:
            produto = Post.query.get(sale.produto_id)
            comprador = User.query.get(sale.comprador_id)
            if produto and comprador:
                sales_history.append({
                    "produto_titulo": produto.titulo,
                    "comprador_nome": comprador.nome,
                    "comprador_username": comprador.username,
                    "price_paid": sale.price_paid,
                    "created_at": sale.created_at.isoformat()
                })

        # Total earned from sales
        total_earned = db.session.query(func.sum(Purchase.price_paid)).join(Post, Purchase.produto_id == Post.id).filter(Post.autor_id == user.id, Post.tipo == "product").scalar() or 0.0

        dashboard_data.update({
            "total_vendas": total_vendas,
            "total_produtos": total_produtos,
            "total_earned": total_earned,
            "curtidas_semana": curtidas_semana,
            "produtos_mais_vistos": [p.to_dict() for p in produtos_mais_vistos],
            "vendas_por_mes": vendas_por_mes_list,
            "sales_history": sales_history
        })

    elif has_purchases:  # Buyer dashboard
        # Total purchases
        total_purchases = Purchase.query.filter_by(comprador_id=user.id).count()

        # Total earned from sold products
        total_earned = db.session.query(func.sum(Purchase.price_paid)).join(Post, Purchase.produto_id == Post.id).filter(Post.autor_id == user.id, Post.tipo == "product").scalar() or 0.0

        # Likes received on user's posts/products
        likes_received = Like.query.join(Post, Like.post_id == Post.id).filter(Post.autor_id == user.id).count()

        # Earnings by month (last 12 months)
        last_year = datetime.utcnow() - timedelta(days=365)
        earnings_por_mes = db.session.query(
            func.extract('month', Purchase.created_at).label('mes'),
            func.sum(Purchase.price_paid).label('ganho')
        ).join(Produto, Purchase.produto_id == Produto.id).filter(Produto.autor_id == user.id, Purchase.created_at >= last_year).group_by(func.extract('month', Purchase.created_at)).all()

        earnings_por_mes_dict = {int(e.mes): float(e.ganho) for e in earnings_por_mes}
        earnings_por_mes_list = [{"mes": month, "ganho": earnings_por_mes_dict.get(month, 0.0)} for month in range(1, 13)]

        # Recent purchases
        recent_purchases = Purchase.query.filter_by(comprador_id=user.id).order_by(Purchase.created_at.desc()).limit(5).all()
        recent_products = []
        for p in recent_purchases:
            produto = Produto.query.get(p.produto_id)
            if produto:
                recent_products.append({
                    "titulo": produto.titulo,
                    "price_paid": p.price_paid,
                    "created_at": p.created_at.isoformat()
                })

        # Liked products
        liked_posts = Like.query.filter_by(user_id=user.id).join(Post, Like.post_id == Post.id).filter(Post.tipo == "product").all()
        liked_products = []
        for l in liked_posts:
            post = Post.query.get(l.post_id)
            if post:
                liked_products.append({
                    "titulo": post.titulo,
                    "preco": post.preco,
                    "created_at": l.created_at.isoformat()
                })

        # Real purchase activities
        purchase_activities = Purchase.query.filter_by(comprador_id=user.id).order_by(Purchase.created_at.desc()).limit(5).all()
        like_activities = Like.query.filter_by(user_id=user.id).join(Post, Like.post_id == Post.id).filter(Post.tipo == "product").order_by(Like.created_at.desc()).limit(5).all()

        activities = []
        for p in purchase_activities:
            produto = Produto.query.get(p.produto_id)
            if produto:
                activities.append({
                    "type": "purchase",
                    "titulo": produto.titulo,
                    "price_paid": p.price_paid,
                    "created_at": p.created_at.isoformat()
                })

        for l in like_activities:
            post = Post.query.get(l.post_id)
            if post:
                activities.append({
                    "type": "like",
                    "titulo": post.titulo,
                    "created_at": l.created_at.isoformat()
                })

        # Sort activities by date and take top 5
        activities.sort(key=lambda x: x['created_at'], reverse=True)
        activities = activities[:5]

        dashboard_data.update({
            "total_purchases": total_purchases,
            "total_earned": total_earned,
            "likes_received": likes_received,
            "earnings_por_mes": earnings_por_mes_list,
            "recent_purchases": recent_products,
            "liked_products": liked_products[:5],  # Top 5
            "purchase_activities": activities
        })

    else:  # General user dashboard
        # Followers count
        followers_count = Follow.query.filter_by(followed_id=user.id).count()

        # Following count
        following_count = Follow.query.filter_by(follower_id=user.id).count()

        # Posts count
        posts_count = Post.query.filter_by(autor_id=user.id).count()

        # Badges
        badges = [badge.to_dict() for badge in user.badges]

        # Recent activity (likes, comments, etc.)
        recent_likes = Like.query.filter_by(user_id=user.id).order_by(Like.created_at.desc()).limit(3).all()
        recent_activity = []
        for l in recent_likes:
            post = Post.query.get(l.post_id)
            if post:
                recent_activity.append({
                    "type": "like",
                    "post_title": post.titulo or post.conteudo[:50],
                    "created_at": l.created_at.isoformat()
                })

        dashboard_data.update({
            "followers_count": followers_count,
            "following_count": following_count,
            "posts_count": posts_count,
            "badges": badges,
            "recent_activity": recent_activity
        })

    return jsonify(dashboard_data)
