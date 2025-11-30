# moderation.py - filtro simples de palavras proibidas (modelo)
BLACKLIST = ["palavrãoteste", "outroexemplo"]

def conteudo_aprovado(texto: str) -> bool:
    if not texto:
        return True
    lower = texto.lower()
    for w in BLACKLIST:
        if w in lower:
            return False
    return True
