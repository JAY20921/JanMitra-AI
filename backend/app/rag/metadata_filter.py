from typing import Dict, Any, Optional
from qdrant_client.models import Filter, FieldCondition, MatchValue
from app.models.user import UserProfile

class MetadataFilter:
    """
    Parses the user's implicit profile to generate hard filters for Qdrant.
    """
    def build_qdrant_filter(self, profile: UserProfile) -> Optional[Filter]:
        """
        Converts a UserProfile into a Qdrant Filter object
        that can be passed to Langchain's QdrantVectorStore search_kwargs.
        """
        conditions = []
        
        # We only apply filters if the user has explicitly provided them
        if profile.state:
            conditions.append(
                FieldCondition(
                    key="metadata.state", 
                    match=MatchValue(value=profile.state)
                )
            )
            
        if profile.category:
            conditions.append(
                FieldCondition(
                    key="metadata.category", 
                    match=MatchValue(value=profile.category)
                )
            )
            
        if not conditions:
            return None
            
        return Filter(must=conditions)
