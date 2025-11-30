from marshmallow import Schema, fields

class UserSchema(Schema):
    id = fields.Int()
    username = fields.Str()
    bio = fields.Str()
    avatar = fields.Str()
    points = fields.Int()

class ProdutoSchema(Schema):
    id = fields.Int()
    titulo = fields.Str()
    descricao = fields.Str()
    preco = fields.Float()
    arquivo = fields.Str()
    autor_id = fields.Int()

class PostSchema(Schema):
    id = fields.Int()
    conteudo = fields.Str()
    imagem = fields.Str()
    tipo = fields.Str()
    autor_id = fields.Int()
