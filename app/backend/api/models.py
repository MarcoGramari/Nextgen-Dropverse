# models.py
from datetime import datetime
from extensions import db
from werkzeug.security import generate_password_hash, check_password_hash

user_badges = db.Table(
    'user_badges',
    db.Column('user_id', db.Integer, db.ForeignKey('users.id'), primary_key=True),
    db.Column('badge_id', db.Integer, db.ForeignKey('badges.id'), primary_key=True)
)

class User(db.Model):
    __tablename__ = "users"
    id = db.Column(db.Integer, primary_key=True)
    nome = db.Column(db.String(120), nullable=False)
    username = db.Column(db.String(80), unique=True, nullable=False)
    email = db.Column(db.String(150), unique=True, nullable=False)
    senha_hash = db.Column(db.String(256), nullable=False)
    bio = db.Column(db.String(250), nullable=True)
    avatar = db.Column(db.String(250), nullable=True)
    parental_email = db.Column(db.String(150), nullable=True)
    is_verified = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    points = db.Column(db.Integer, default=0)

    produtos = db.relationship('Produto', backref='autor', lazy=True)
    posts = db.relationship('Post', backref='autor', lazy=True)
    purchases = db.relationship('Purchase', backref='comprador', lazy=True)
    badges = db.relationship('Badge', secondary=user_badges, backref='users')

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
            "is_verified": self.is_verified
        }


class Produto(db.Model):
    __tablename__ = "produtos"
    id = db.Column(db.Integer, primary_key=True)
    titulo = db.Column(db.String(200), nullable=False)
    descricao = db.Column(db.Text, nullable=True)
    preco = db.Column(db.Float, nullable=False, default=0.0)
    file_path = db.Column(db.String(300), nullable=False)
    file_mime = db.Column(db.String(80), nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    autor_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    downloads = db.Column(db.Integer, default=0)
    tags = db.Column(db.String(250), nullable=True)
    categoria = db.Column(db.String(80), nullable=True)

    def to_dict(self):
        return {
            "id": self.id,
            "titulo": self.titulo,
            "descricao": self.descricao,
            "preco": self.preco,
            "file_path": self.file_path,
            "autor_id": self.autor_id,
            "created_at": self.created_at.isoformat(),
            "tags": self.tags,
            "categoria": self.categoria
        }


class Post(db.Model):
    __tablename__ = "posts"
    id = db.Column(db.Integer, primary_key=True)
    tipo = db.Column(db.String(30), default="social")  # social | product
    conteudo = db.Column(db.Text, nullable=True)
    imagem = db.Column(db.String(250), nullable=True)
    autor_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    # Product fields
    titulo = db.Column(db.String(200), nullable=True)
    descricao = db.Column(db.Text, nullable=True)
    preco = db.Column(db.Float, nullable=True)
    categoria = db.Column(db.String(80), nullable=True)
    file_path = db.Column(db.String(300), nullable=True)

    comments = db.relationship('Comment', backref='post', lazy=True, cascade="all, delete-orphan")
    likes_rel = db.relationship('Like', backref='post', lazy=True, cascade="all, delete-orphan")

    def to_dict(self):
        likes_count = len(self.likes_rel) if self.likes_rel is not None else 0
        base = {
            "id": self.id,
            "tipo": self.tipo,
            "content": self.conteudo,
            "image": self.imagem,
            "autor_id": self.autor_id,
            "likes": likes_count,
            "comments_count": len(self.comments) if self.comments is not None else 0,
            "created_at": self.created_at.isoformat()
        }
        if self.tipo == "product":
            base.update({
                "titulo": self.titulo,
                "descricao": self.descricao,
                "preco": self.preco,
                "categoria": self.categoria,
                "file_path": self.file_path
            })
        return base


class Chat(db.Model):
    __tablename__ = "chats"
    id = db.Column(db.Integer, primary_key=True)
    is_temp = db.Column(db.Boolean, default=False)
    last_activity = db.Column(db.DateTime, default=datetime.utcnow)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    participant_a = db.Column(db.Integer, db.ForeignKey('users.id'))
    participant_b = db.Column(db.Integer, db.ForeignKey('users.id'))
    messages = db.relationship('Message', backref='chat', lazy=True, cascade="all, delete-orphan")

    def to_dict(self):
        return {
            "id": self.id,
            "is_temp": self.is_temp,
            "last_activity": self.last_activity.isoformat()
        }


class Message(db.Model):
    __tablename__ = "messages"
    id = db.Column(db.Integer, primary_key=True)
    chat_id = db.Column(db.Integer, db.ForeignKey('chats.id'), nullable=False)
    remetente_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    conteudo = db.Column(db.Text, nullable=True)
    imagem = db.Column(db.String(250), nullable=True)
    data_envio = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            "id": self.id,
            "chat_id": self.chat_id,
            "remetente_id": self.remetente_id,
            "conteudo": self.conteudo,
            "data_envio": self.data_envio.isoformat()
        }


class Purchase(db.Model):
    __tablename__ = "purchases"
    id = db.Column(db.Integer, primary_key=True)
    comprador_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    produto_id = db.Column(db.Integer, db.ForeignKey('produtos.id'), nullable=False)
    price_paid = db.Column(db.Float, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)


class Like(db.Model):
    __tablename__ = "likes"
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    post_id = db.Column(db.Integer, db.ForeignKey('posts.id'), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    __table_args__ = (db.UniqueConstraint('user_id', 'post_id', name='_user_post_uc'),)


class Comment(db.Model):
    __tablename__ = "comments"
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    post_id = db.Column(db.Integer, db.ForeignKey('posts.id'), nullable=False)
    conteudo = db.Column(db.Text, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    user = db.relationship('User', backref='comments', lazy=True)

    def to_dict(self):
        username = getattr(self.user, "username", None)
        return {
            "id": self.id,
            "user_id": self.user_id,
            "post_id": self.post_id,
            "conteudo": self.conteudo,
            "created_at": self.created_at.isoformat(),
            "username": username
        }

class Dispute(db.Model):
    __tablename__ = "disputes"
    id = db.Column(db.Integer, primary_key=True)
    purchase_id = db.Column(db.Integer, db.ForeignKey('purchases.id'), nullable=False)
    comprador_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    motivo = db.Column(db.Text, nullable=False)
    status = db.Column(db.String(50), default="Pendente")
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

class Report(db.Model):
    __tablename__ = "reports"
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    post_id = db.Column(db.Integer, db.ForeignKey('posts.id'), nullable=True)
    comment_id = db.Column(db.Integer, db.ForeignKey('comments.id'), nullable=True)
    motivo = db.Column(db.Text, nullable=False)
    status = db.Column(db.String(50), default="Pendente")
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

class Follow(db.Model):
    __tablename__ = "follows"
    id = db.Column(db.Integer, primary_key=True)
    follower_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    followed_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    __table_args__ = (db.UniqueConstraint('follower_id', 'followed_id', name='_follower_followed_uc'),)

    follower = db.relationship('User', foreign_keys=[follower_id], backref='following_rel')
    followed = db.relationship('User', foreign_keys=[followed_id], backref='followers_rel')

class Badge(db.Model):
    __tablename__ = "badges"
    id = db.Column(db.Integer, primary_key=True)
    nome = db.Column(db.String(80), nullable=False)
    descricao = db.Column(db.String(200), nullable=True)
    icon = db.Column(db.String(200), nullable=True)
