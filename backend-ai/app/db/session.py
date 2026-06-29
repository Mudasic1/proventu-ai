from collections.abc import Generator

import psycopg
from psycopg.rows import dict_row
from sqlmodel import Session, create_engine

from app.core.config import get_settings

_engine = None


def get_engine():
    global _engine
    if _engine is None:
        settings = get_settings()
        _engine = create_engine(settings.database_uri.replace("psycopg://", "postgresql://"))
    return _engine


def get_session() -> Generator[Session, None, None]:
    with Session(get_engine()) as session:
        yield session


def get_psycopg_connection():
    settings = get_settings()
    return psycopg.connect(settings.database_uri, row_factory=dict_row)
