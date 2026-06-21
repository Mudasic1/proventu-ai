import logging
from typing import Any

from qdrant_client import QdrantClient
from qdrant_client.models import Distance, PointStruct, VectorParams


logger = logging.getLogger(__name__)

COLLECTION_NAME = "proventu_knowledge"
EMBEDDING_SIZE = 768


_client: QdrantClient | None = None


def _get_client() -> QdrantClient:
    global _client
    if _client is None:
        _client = QdrantClient(path=".qdrant_data")
        _ensure_collection(_client)
    return _client


def _ensure_collection(client: QdrantClient) -> None:
    try:
        collections = client.get_collections().collections
        exists = any(c.name == COLLECTION_NAME for c in collections)
        if not exists:
            client.create_collection(
                collection_name=COLLECTION_NAME,
                vectors_config=VectorParams(
                    size=EMBEDDING_SIZE,
                    distance=Distance.COSINE,
                ),
            )
            logger.info("Created Qdrant collection: %s", COLLECTION_NAME)
    except Exception as exc:
        logger.warning("Qdrant collection setup skipped: %s", exc)


def index_document(
    doc_id: str,
    text: str,
    metadata: dict[str, Any] | None = None,
    embedding: list[float] | None = None,
) -> None:
    """Index a document into Qdrant for semantic search."""
    try:
        client = _get_client()
        vector = embedding or [0.0] * EMBEDDING_SIZE
        client.upsert(
            collection_name=COLLECTION_NAME,
            points=[
                PointStruct(
                    id=hash(doc_id) % (2**63),
                    vector=vector,
                    payload={
                        "doc_id": doc_id,
                        "text": text[:2000],
                        **(metadata or {}),
                    },
                )
            ],
        )
    except Exception as exc:
        logger.warning("Qdrant index_document failed: %s", exc)


def search_knowledge(
    query_vector: list[float],
    limit: int = 5,
    filter_query: dict[str, Any] | None = None,
) -> list[dict[str, Any]]:
    """Search the knowledge base by vector similarity."""
    try:
        client = _get_client()
        kwargs: dict[str, Any] = dict(
            collection_name=COLLECTION_NAME,
            query=query_vector,
            limit=limit,
        )
        if filter_query is not None:
            from qdrant_client.models import Filter
            kwargs["query_filter"] = Filter(**filter_query) if isinstance(filter_query, dict) else filter_query
        response = client.query_points(**kwargs)
        return [
            {
                "doc_id": hit.payload.get("doc_id", ""),
                "text": hit.payload.get("text", ""),
                "score": hit.score,
                "metadata": {
                    k: v for k, v in (hit.payload or {}).items()
                    if k not in ("doc_id", "text")
                },
            }
            for hit in response.points
        ]
    except Exception as exc:
        logger.warning("Qdrant search failed: %s", exc)
        return []


def delete_document(doc_id: str) -> None:
    """Remove a document from the knowledge base."""
    try:
        client = _get_client()
        client.delete(
            collection_name=COLLECTION_NAME,
            points_selector=[hash(doc_id) % (2**63)],
        )
    except Exception as exc:
        logger.warning("Qdrant delete failed: %s", exc)
