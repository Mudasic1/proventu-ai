import os
import pathlib

import psycopg
from dotenv import load_dotenv


def apply_migrations():
    load_dotenv()
    database_uri = os.getenv("DATABASE_URI")
    if not database_uri:
        print("DATABASE_URI not found in environment!")
        return

    migrations_dir = pathlib.Path(__file__).parent / "migrations"
    sql_files = sorted(migrations_dir.glob("*.sql"))

    if not sql_files:
        print("No migration files found.")
        return

    print("Connecting to database...")
    with psycopg.connect(database_uri) as conn:
        with conn.cursor() as cur:
            for sql_file in sql_files:
                print(f"Applying {sql_file.name}...")
                sql = sql_file.read_text(encoding="utf-8")
                cur.execute(sql)
            conn.commit()
    print("All migrations applied successfully!")


if __name__ == "__main__":
    apply_migrations()
