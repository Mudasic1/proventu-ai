import os
import psycopg
from dotenv import load_dotenv

def apply_migrations():
    # Load .env
    load_dotenv()
    database_uri = os.getenv("DATABASE_URI")
    if not database_uri:
        print("DATABASE_URI not found in environment!")
        return

    print("Connecting to database...")
    with psycopg.connect(database_uri) as conn:
        with conn.cursor() as cur:
            migration_path = os.path.join(os.path.dirname(__file__), "migrations", "0001_ai_campaign_runtime.sql")
            print(f"Reading migration file from: {migration_path}")
            with open(migration_path, "r", encoding="utf-8") as f:
                sql = f.read()
            
            print("Applying migration SQL...")
            cur.execute(sql)
            conn.commit()
            print("Migration applied successfully!")

if __name__ == "__main__":
    apply_migrations()
