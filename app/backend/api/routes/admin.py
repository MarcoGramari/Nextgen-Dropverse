# admin.py - estatísticas simples e ferramentas de moderação
from flask import Blueprint, jsonify
from models import User, Produto, Post, Purchase
from extensions import db
from sqlalchemy import func

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

    # Vendas por mês
    vendas_por_mes = db.session.query(
        func.extract('month', Purchase.created_at).label('mes'),
        func.count(Purchase.id).label('vendas')
    ).group_by(func.extract('month', Purchase.created_at)).all()

    vendas_por_mes_list = [{"mes": int(v.mes), "vendas": v.vendas} for v in vendas_por_mes]

    return jsonify({
        "total_vendas": total_vendas,
        "total_produtos": total_produtos,
        "curtidas_semana": curtidas_semana,
        "produtos_mais_vistos": [p.to_dict() for p in produtos_mais_vistos],
        "vendas_por_mes": vendas_por_mes_list
    })
