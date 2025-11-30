# file_utils.py - funções para salvar arquivos com nomes seguros e gerar links temporários

import os
import uuid
from werkzeug.utils import secure_filename
from config import Config

ALLOWED = {"pdf", "zip", "png", "jpeg", "jpg", "mp3"}

def allowed_file(filename):
    ext = filename.rsplit('.', 1)[-1].lower()
    return '.' in filename and ext in ALLOWED

def save_upload(file_storage):
    """
    Salva o arquivo dentro de UPLOAD_FOLDER e retorna o caminho relativo.
    """
    filename = secure_filename(file_storage.filename)
    ext = filename.rsplit('.', 1)[-1].lower()
    uid = str(uuid.uuid4())
    new_name = f"{uid}.{ext}"
    dest = os.path.join(Config.UPLOAD_FOLDER, new_name)
    file_storage.save(dest)
    return new_name, dest, file_storage.mimetype
