# backend/api/routes/user.py
from flask import Blueprint, request, jsonify
from extensions import db
from models import User
from utils.jwt_utils import decode_jwt
from config import Config
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
