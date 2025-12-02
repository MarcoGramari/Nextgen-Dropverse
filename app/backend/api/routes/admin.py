# admin.py - estatísticas simples e ferramentas de moderação
from flask import Blueprint, jsonify
from models import User, Produto, Post, Purchase
from extensions import db

bp = Blueprint("admin", __name__)

@bp.route("/admin/stats", methods=["GET"])
def stats():
    return jsonify({
        "usuarios": User.query.count(),
        "produtos": Produto.query.count(),
        "posts": Post.query.count()
    })

@bp.route("/admin/analytics", methods=["GET"])
def analytics():
    # RFA1: Módulo de Análise Simples
    # Total de vendas
    total_vendas = Purchase.query.count()
    
    # Total de produtos
    total_produtos = Produto.query.count()
    
    # Total de curtidas na semana (simulação)
    from datetime import datetime, timedelta
    from models import Like
    
    semana_passada = datetime.utcnow() - timedelta(days=7)
    curtidas_semana = Like.query.filter(Like.created_at >= semana_passada).count()
    
    # Produtos mais vistos (simulação: top 3 por downloads)
    produtos_mais_vistos = Produto.query.order_by(Produto.downloads.desc()).limit(3).all()
    
    return jsonify({
        "total_vendas": total_vendas,
        "total_produtos": total_produtos,
        "curtidas_semana": curtidas_semana,
        "produtos_mais_vistos": [p.to_dict() for p in produtos_mais_vistos]
    })
