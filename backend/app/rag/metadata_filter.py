from typing import Dict, Any, Optional, List
from qdrant_client.models import Filter, FieldCondition, MatchValue
from app.models.user import UserProfile

# Catch-all values used by Central/universal schemes in the knowledge base
_CENTRAL_STATE_VALUES = ["All", "Central", "all", "central"]
_GENERAL_CATEGORY_VALUES = ["All", "General", "all", "general"]


class MetadataFilter:
    """
    Parses the user's implicit profile to generate hard filters for Qdrant.

    IMPORTANT: Each field filter uses a `should` (OR) clause so that schemes
    tagged as "All" / "Central" are *always* included alongside the user's
    specific value.  This prevents Central Government schemes from being
    silently dropped when a user selects a particular state.
    """

    def build_qdrant_filter(self, profile: UserProfile) -> Optional[Filter]:
        """
        Converts a UserProfile into a Qdrant Filter object
        that can be passed to Langchain's QdrantVectorStore search_kwargs.

        For each demographic field the filter is:
            (field == user_value) OR (field IN catch_all_values)

        Multiple fields are combined with `must` (AND) so *all* provided
        demographic axes still apply.
        """
        must_clauses: List[Filter] = []

        # --- State filter (OR with central / "All" entries) ---
        if profile.state:
            state_options = [profile.state] + [
                v for v in _CENTRAL_STATE_VALUES if v != profile.state
            ]
            must_clauses.append(
                Filter(
                    should=[
                        FieldCondition(
                            key="metadata.state",
                            match=MatchValue(value=val),
                        )
                        for val in state_options
                    ]
                )
            )

        # --- Category filter (OR with general / "All" entries) ---
        if profile.category:
            category_options = [profile.category] + [
                v for v in _GENERAL_CATEGORY_VALUES if v != profile.category
            ]
            must_clauses.append(
                Filter(
                    should=[
                        FieldCondition(
                            key="metadata.category",
                            match=MatchValue(value=val),
                        )
                        for val in category_options
                    ]
                )
            )

        if not must_clauses:
            return None

        # Combine the per-field OR groups with a top-level AND
        return Filter(must=must_clauses)
