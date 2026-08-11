import os
import aiosqlite
import json
import hashlib
from datetime import datetime, timedelta
from typing import Optional, Dict, Any


class SchemeCache:
    """
    SQLite-based cache for AI-extracted scheme data.
    Prevents redundant LLM calls for the same URL.
    """

    def __init__(self, db_path: str = "data/scheme_cache.db", ttl_hours: int = 24):
        # Allow override from env or use absolute path based on project root
        project_root = os.path.dirname(
            os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
        )
        default_db_path = os.path.join(project_root, "data", "scheme_cache.db")
        self.db_path = (
            db_path if db_path.startswith("/") or ":" in db_path else default_db_path
        )
        self.ttl_hours = ttl_hours

    def _get_url_hash(self, url: str) -> str:
        return hashlib.sha256(url.encode()).hexdigest()

    async def init_db(self):
        """Creates the cache table if it doesn't exist."""
        os.makedirs(os.path.dirname(self.db_path), exist_ok=True)
        async with aiosqlite.connect(self.db_path) as db:
            await db.execute("""
                CREATE TABLE IF NOT EXISTS scheme_cache (
                    url_hash TEXT PRIMARY KEY,
                    source_url TEXT,
                    extracted_data TEXT,
                    created_at TIMESTAMP
                )
            """)
            await db.execute("""
                CREATE TABLE IF NOT EXISTS api_response_cache (
                    query_hash TEXT PRIMARY KEY,
                    response_data TEXT,
                    created_at TIMESTAMP
                )
            """)
            await db.commit()

    async def get(self, url: str) -> Optional[Dict[str, Any]]:
        """
        Retrieves cached scheme data if it exists and is not expired.
        """
        url_hash = self._get_url_hash(url)
        async with aiosqlite.connect(self.db_path) as db:
            async with db.execute(
                "SELECT extracted_data, created_at FROM scheme_cache WHERE url_hash = ?",
                (url_hash,),
            ) as cursor:
                row = await cursor.fetchone()
                if row:
                    extracted_data_json, created_at_str = row
                    created_at = datetime.fromisoformat(created_at_str)

                    # Check TTL
                    if datetime.now() - created_at < timedelta(hours=self.ttl_hours):
                        return json.loads(extracted_data_json)
                    else:
                        # Expired, clean it up
                        await db.execute(
                            "DELETE FROM scheme_cache WHERE url_hash = ?", (url_hash,)
                        )
                        await db.commit()
        return None

    async def set(self, url: str, extracted_data: Dict[str, Any]):
        """
        Stores AI-extracted scheme data in the cache.
        """
        url_hash = self._get_url_hash(url)
        created_at = datetime.now().isoformat()
        extracted_data_json = json.dumps(extracted_data)

        async with aiosqlite.connect(self.db_path) as db:
            await db.execute(
                """
                INSERT OR REPLACE INTO scheme_cache 
                (url_hash, source_url, extracted_data, created_at) 
                VALUES (?, ?, ?, ?)
                """,
                (url_hash, url, extracted_data_json, created_at),
            )
            await db.commit()

    async def get_api_response(self, query_hash: str) -> Optional[list]:
        """
        Retrieves a full cached API response for a specific filter combination.
        """
        async with aiosqlite.connect(self.db_path) as db:
            async with db.execute(
                "SELECT response_data, created_at FROM api_response_cache WHERE query_hash = ?",
                (query_hash,),
            ) as cursor:
                row = await cursor.fetchone()
                if row:
                    response_data_json, created_at_str = row
                    created_at = datetime.fromisoformat(created_at_str)

                    # Check TTL
                    if datetime.now() - created_at < timedelta(hours=self.ttl_hours):
                        return json.loads(response_data_json)
                    else:
                        # Expired
                        await db.execute(
                            "DELETE FROM api_response_cache WHERE query_hash = ?", (query_hash,)
                        )
                        await db.commit()
        return None

    async def set_api_response(self, query_hash: str, response_data: list):
        """
        Stores a full API response in the cache.
        """
        created_at = datetime.now().isoformat()
        response_data_json = json.dumps(response_data)

        async with aiosqlite.connect(self.db_path) as db:
            await db.execute(
                """
                INSERT OR REPLACE INTO api_response_cache 
                (query_hash, response_data, created_at) 
                VALUES (?, ?, ?)
                """,
                (query_hash, response_data_json, created_at),
            )
            await db.commit()
