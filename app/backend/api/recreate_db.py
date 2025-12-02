from pathlib import Path
import os
import sys

# Ensure project package imports work when running this script
HERE = Path(__file__).resolve().parent
sys.path.insert(0, str(HERE))

from app import create_app
from extensions import db
from models import User, Badge, Produto

def recreate_db():
    db_path = HERE / "dropverse.db"

    # Create app first so we can use SQLAlchemy engine/session to cleanly drop tables
    app = create_app()
    with app.app_context():
        print("Removing existing DB objects (if any)...")
        try:
            # remove any active sessions, drop all tables
            db.session.remove()
            db.drop_all()
            print("Dropped all tables via SQLAlchemy.")
        except Exception as e:
            print("Warning: error dropping tables:", e)

        # dispose the engine to close any connections that might lock the sqlite file
        try:
            db.engine.dispose()
        except Exception:
            pass

    # attempt to remove the sqlite file after disposing connections
    if db_path.exists():
        try:
            print(f"Removing existing database file: {db_path}")
            os.remove(db_path)
        except Exception as e:
            print("Could not remove sqlite file, it may be locked. Continuing and attempting to recreate schema via SQLAlchemy.", e)

    # Recreate app and schema
    app = create_app()
    with app.app_context():
        print("Creating database schema...")
        db.create_all()

        # Seed default badges
        if Badge.query.count() == 0:
            print("Seeding badges...")
            badges = [
                Badge(nome="Starter", descricao="Badge inicial para novos usuários"),
                Badge(nome="Verified", descricao="Conta com verificação parental"),
            ]
            db.session.add_all(badges)

        # Seed admin user
        if User.query.filter_by(username="admin").first() is None:
            print("Creating admin user (username: admin, password: adminpass)")
            admin = User(nome="Administrator", username="admin", email="admin@dropverse.local")
            admin.set_password("adminpass")
            admin.is_verified = True
            db.session.add(admin)
            db.session.flush()  # ensure admin.id is available

        # Seed a sample product if none exist
        if Produto.query.count() == 0:
            print("Seeding sample product...")
            autor_id = User.query.filter_by(username="admin").first().id
            prod = Produto(titulo="Produto Exemplo", descricao="Arquivo de demonstração", preco=0.0, file_path="uploads/example.txt", autor_id=autor_id)
            db.session.add(prod)

        db.session.commit()
        print("Database recreated and seeded successfully.")


if __name__ == "__main__":
    recreate_db()
