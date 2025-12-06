# routes/uploads.py
from flask import Blueprint, request, jsonify, current_app
import os
from werkzeug.utils import secure_filename
from config import Config
import uuid

bp = Blueprint("uploads", __name__)

ALLOWED_EXTENSIONS = {"png", "jpg", "jpeg", "gif", "zip", "pdf"}

def allowed(filename):
    return "." in filename and filename.rsplit(".", 1)[1].lower() in ALLOWED_EXTENSIONS

@bp.post("/upload")
def upload_file():
    if "file" not in request.files:
        return jsonify({"error": "Nenhum arquivo recebido"}), 400

    file = request.files["file"]

    if file.filename == "":
        return jsonify({"error": "Nome do arquivo vazio"}), 400

    filename = secure_filename(file.filename)

    if not allowed(filename):
        return jsonify({"error": "Extensão não permitida"}), 400

    ext = filename.rsplit(".", 1)[1].lower()
    new_filename = f"{uuid.uuid4()}.{ext}"

    save_folder = current_app.config.get('UPLOAD_FOLDER', Config.UPLOAD_FOLDER)
    os.makedirs(save_folder, exist_ok=True)
    save_path = os.path.join(save_folder, new_filename)

    try:
        file.save(save_path)
    except Exception as e:
        return jsonify({"error": "Falha ao salvar arquivo", "detail": str(e)}), 500

    return jsonify({
        "success": True,
        "filename": new_filename
    }), 201
