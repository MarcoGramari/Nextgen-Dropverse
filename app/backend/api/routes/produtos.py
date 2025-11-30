# produtos.py - upload, listagem, download (arquivos protegidos temporariamente)
from flask import Blueprint, request, jsonify, current_app, send_from_directory, url_for
from extensions import db
from models import Produto, User, Purchase
from utils.file_utils import save_upload
from utils.jwt_utils import decode_token
import os
from datetime import datetime, timedelta
from config import Config

bp = Blueprint("produtos", __name__)

@bp.route("/produtos/", methods=["GET"])
def listar_produtos():
    produtos = Produto.query.order_by(Produto.created_at.desc()).all()
    return jsonify([p.to_dict() for p in produtos])

@bp.route("/produtos/<int:id>", methods=["GET"])
def obter_produto(id):
    p = Produto.query.get_or_404(id)
    return jsonify(p.to_dict())

@bp.route("/produtos/upload", methods=["POST"])
def upload_produto():
    # espera multipart/form-data: arquivo + titulo + descricao + preco + autor_id
    if 'arquivo' not in request.files:
        return jsonify({"error": "Arquivo não enviado"}), 400
    file = request.files['arquivo']
    titulo = request.form.get("titulo")
    descricao = request.form.get("descricao")
    preco = float(request.form.get("preco") or 0)
    autor_id = int(request.form.get("autor_id") or 0)

    if not file:
        return jsonify({"error": "Arquivo inválido"}), 400
    if not file.filename:
        return jsonify({"error": "Arquivo com nome inválido"}), 400
    if not titulo or not autor_id:
        return jsonify({"error": "Dados incompletos"}), 400

    # valida extensão
    if not file:
        return jsonify({"error": "Arquivo inválido"}), 400

    filename, fullpath, mimetype = save_upload(file)

    produto = Produto(
        titulo=titulo,
        descricao=descricao,
        preco=preco,
        file_path=filename,
        file_mime=mimetype,
        autor_id=autor_id
    )
    db.session.add(produto)
    db.session.commit()
    return jsonify({"msg": "Produto enviado", "id": produto.id}), 201

@bp.route("/produtos/download/<path:filename>", methods=["GET"])
def download_produto(filename):
    """
    Serve arquivo via send_from_directory. Em produção, servir via CDN ou storage com links temporários.
    """
    uploads_dir = current_app.config['UPLOAD_FOLDER']
    # verificar se o arquivo existe:
    path = os.path.join(uploads_dir, filename)
    if not os.path.exists(path):
        return jsonify({"error": "Arquivo não encontrado"}), 404
    # incrementa contador (opcional)
    produto = Produto.query.filter_by(file_path=filename).first()
    if produto:
        produto.downloads = (produto.downloads or 0) + 1
        db.session.commit()
    return send_from_directory(uploads_dir, filename, as_attachment=True)
