import json
import logging
from typing import Dict, Any, Optional, List
from pydantic import BaseModel, Field
from langchain_core.prompts import PromptTemplate
from langchain_core.output_parsers import JsonOutputParser
from app.llm.providers import LLMFactory
from app.llm.prompts import PromptBuilder
from app.models.user import UserProfile

logger = logging.getLogger(__name__)

from typing import Literal


class ExtractedScheme(BaseModel):
    is_valid_scheme: bool = Field(
        description="True if the text describes a specific government scheme, false otherwise."
    )
    title: str = Field(description="Clean, concise title of the scheme.")
    ministry: str = Field(description="The responsible ministry or state government.")
    eligibility_summary: str = Field(description="Concise summary of eligibility.")
    benefits: List[str] = Field(description="List of up to 4 distinct benefits.")
    eligibility_status: Literal[
        "supported",
        "partially_supported",
        "insufficient_evidence",
        "conflicting_evidence",
    ] = Field(
        default="insufficient_evidence",
        description="Indicate 'supported' if the user profile fully matches, 'partially_supported' if it matches some but misses others, 'insufficient_evidence' if profile lacks data, or 'conflicting_evidence' if profile explicitly disqualifies.",
    )
    match_score: int = Field(
        default=85,
        description="A score from 0 to 100 indicating how well the user profile matches the scheme. 100 is a perfect match.",
    )


class SchemeExtractor:
    """
    Uses an LLM to extract structured scheme data from raw web content.
    """

    def __init__(self, provider_name: str = "groq", model_name: Optional[str] = None):
        # We can use a fast model for extraction
        self.llm = LLMFactory.get_provider(provider_name, model_name)

        self.parser = JsonOutputParser(pydantic_object=ExtractedScheme)

        self.prompt = PromptTemplate(
            template=PromptBuilder.SCHEME_EXTRACTION_TEMPLATE
            + "\n\nUser Profile for Eligibility Check:\n{user_profile}\n\nBased on the User Profile, determine the user's eligibility_status for this scheme and provide a match_score (0-100).\n{format_instructions}",
            input_variables=["text", "user_profile"],
            partial_variables={
                "format_instructions": self.parser.get_format_instructions()
            },
        )

        self.chain = self.prompt | self.llm | self.parser

    async def extract(
        self, text: str, user_profile: Optional[UserProfile] = None
    ) -> Optional[ExtractedScheme]:
        """
        Extracts structured data from raw text and evaluates user eligibility.
        Returns an ExtractedScheme object, or None if extraction fails.
        """
        if not text or len(text.strip()) < 50:
            return None

        try:
            # We truncate text to roughly 1200 words to avoid context limits
            # and excessive token usage for extraction
            truncated_text = text[:6000]

            profile_str = (
                user_profile.model_dump_json()
                if user_profile
                else "No profile provided"
            )
            result = await self.chain.ainvoke(
                {"text": truncated_text, "user_profile": profile_str}
            )

            # The parser returns a dict matching the Pydantic schema
            extracted = ExtractedScheme(**result)
            return extracted

        except Exception as e:
            logger.error(f"Failed to extract scheme data using LLM: {e}")
            return None
