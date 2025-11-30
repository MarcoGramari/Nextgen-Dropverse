# routes/uploads.py
from flask import Blueprint, request, jsonify
import os
from werkzeug.utils import secure_filename
from config import Config

bp = Blueprint("uploads", __name__)

@bp.post("/upload")
def upload_file():
    if "file" not in request.files:
        return jsonify({"error": "Nenhum arquivo recebido"}), 400

    file = request.files["file"]
    filename = secure_filename(file.filename)

    save_path = os.path.join(Config.UPLOAD_FOLDER, filename)
    file.save(save_path)

    return jsonify({"success": True, "filename": filename})
