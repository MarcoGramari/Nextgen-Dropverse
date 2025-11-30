# models.py
# Dropverse Nextgen – Modelos reformulados com relacionamentos consistentes,
# chaves estrangeiras padronizadas e estrutura escalável.

from datetime import datetime
from extensions import db
from werkzeug.security import generate_password_hash, check_password_hash


# ============================================================
# TABELA DE ASSOCIAÇÃO: Usuários ↔ Badges (N:N)
# ============================================================

user_badges = db.Table(
    "user_badges",
    db.Column("user_id", db.Integer, db.ForeignKey("users.id", ondelete="CASCADE"), primary_key=True),
    db.Column("badge_id", db.Integer, db.ForeignKey("badges.id", ondelete="CASCADE"), primary_key=True)
)


# ============================================================
# USER
# ============================================================

class User(db.Model):
    __tablename__ = "users"

    id = db.Column(db.Integer, primary_key=True)
    
    nome = db.Column(db.String(120), nullable=False)
    username = db.Column(db.String(80), unique=True, nullable=False, index=True)
    email = db.Column(db.String(150), unique=True, nullable=False)

    senha_hash = db.Column(db.String(256), nullable=False)

    bio = db.Column(db.String(250))
    avatar = db.Column(db.String(250))

    parental_email = db.Column(db.String(150))
    is_verified = db.Column(db.Boolean, default=False)

    points = db.Column(db.Integer, default=0)

    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    # RELACIONAMENTOS
    produtos = db.relationship("Produto", backref="autor", lazy=True, cascade="all, delete")
    posts = db.relationship("Post", backref="autor", lazy=True, cascade="all, delete")
    purchases = db.relationship("Purchase", backref="comprador", lazy=True, cascade="all, delete-orphan")

    # chats onde o usuário é participante A
    chats_a = db.relationship("Chat",
                              foreign_keys="Chat.participant_a",
                              backref="user_a",
                              lazy=True,
                              cascade="all, delete")

    # chats onde o usuário é participante B
    chats_b = db.relationship("Chat",
                              foreign_keys="Chat.participant_b",
                              backref="user_b",
                              lazy=True,
                              cascade="all, delete")

    badges = db.relationship("Badge", secondary=user_badges, backref="users", lazy="dynamic")

    # PASSWORD
    def set_password(self, senha):
        self.senha_hash = generate_password_hash(senha)

    def check_password(self, senha):
        return check_password_hash(self.senha_hash, senha)

    def to_dict(self):
        return {
            "id": self.id,
            "nome": self.nome,
            "username": self.username,
            "email": self.email,
            "bio": self.bio,
            "avatar": self.avatar,
            "points": self.points,
            "is_verified": self.is_verified,
        }


# ============================================================
# PRODUTO DIGITAL
# ============================================================

class Produto(db.Model):
    __tablename__ = "produtos"

    id = db.Column(db.Integer, primary_key=True)

    titulo = db.Column(db.String(200), nullable=False)
    descricao = db.Column(db.Text)
    preco = db.Column(db.Float, nullable=False, default=0.0)

    file_path = db.Column(db.String(300), nullable=False)
    file_mime = db.Column(db.String(80))

    downloads = db.Column(db.Integer, default=0)

    autor_id = db.Column(db.Integer, db.ForeignKey("users.id", ondelete="CASCADE"), nullable=False)

    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    # RELAÇÃO: purchases → produto
    purchases = db.relationship("Purchase", backref="produto", lazy=True, cascade="all, delete-orphan")

    def to_dict(self):
        return {
            "id": self.id,
            "titulo": self.titulo,
            "descricao": self.descricao,
            "preco": self.preco,
            "file_path": self.file_path,
            "autor_id": self.autor_id,
            "created_at": self.created_at.isoformat(),
        }


# ============================================================
# POST (conteúdo social ou divulgação de produto)
# ============================================================

class Post(db.Model):
    __tablename__ = "posts"

    id = db.Column(db.Integer, primary_key=True)

    tipo = db.Column(db.String(30), default="social")  # social | product
    conteudo = db.Column(db.Text)
    imagem = db.Column(db.String(250))

    autor_id = db.Column(db.Integer, db.ForeignKey("users.id", ondelete="CASCADE"), nullable=False)

    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    likes = db.Column(db.Integer, default=0)

    def to_dict(self):
        return {
            "id": self.id,
            "tipo": self.tipo,
            "conteudo": self.conteudo,
            "imagem": self.imagem,
            "autor_id": self.autor_id,
            "likes": self.likes,
        }


# ============================================================
# CHAT
# ============================================================

class Chat(db.Model):
    __tablename__ = "chats"

    id = db.Column(db.Integer, primary_key=True)

    is_temp = db.Column(db.Boolean, default=False)

    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    last_activity = db.Column(db.DateTime, default=datetime.utcnow)

    participant_a = db.Column(db.Integer, db.ForeignKey("users.id", ondelete="CASCADE"))
    participant_b = db.Column(db.Integer, db.ForeignKey("users.id", ondelete="CASCADE"))

    # mensagens
    messages = db.relationship("Message", backref="chat", lazy=True, cascade="all, delete-orphan")

    def to_dict(self):
        return {
            "id": self.id,
            "is_temp": self.is_temp,
            "last_activity": self.last_activity.isoformat(),
        }


# ============================================================
# MESSAGE
# ============================================================

class Message(db.Model):
    __tablename__ = "messages"

    id = db.Column(db.Integer, primary_key=True)

    chat_id = db.Column(db.Integer, db.ForeignKey("chats.id", ondelete="CASCADE"), nullable=False)
    remetente_id = db.Column(db.Integer, db.ForeignKey("users.id", ondelete="CASCADE"), nullable=False)

    conteudo = db.Column(db.Text)
    imagem = db.Column(db.String(250))

    data_envio = db.Column(db.DateTime, default=datetime.utcnow)

    remetente = db.relationship("User", backref="mensagens_enviadas")

    def to_dict(self):
        return {
            "id": self.id,
            "chat_id": self.chat_id,
            "remetente_id": self.remetente_id,
            "conteudo": self.conteudo,
            "data_envio": self.data_envio.isoformat(),
        }


# ============================================================
# PURCHASE
# ============================================================

class Purchase(db.Model):
    __tablename__ = "purchases"

    id = db.Column(db.Integer, primary_key=True)

    comprador_id = db.Column(db.Integer, db.ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    produto_id = db.Column(db.Integer, db.ForeignKey("produtos.id", ondelete="CASCADE"), nullable=False)

    price_paid = db.Column(db.Float, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)


# ============================================================
# BADGE (conquistas)
# ============================================================

class Badge(db.Model):
    __tablename__ = "badges"

    id = db.Column(db.Integer, primary_key=True)

    nome = db.Column(db.String(80), nullable=False)
    descricao = db.Column(db.String(200))
    icon = db.Column(db.String(200))
