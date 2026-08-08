import json
import logging
from typing import Dict, Any, Optional, List
from pydantic import BaseModel, Field
from langchain_core.prompts import PromptTemplate
from langchain_core.output_parsers import JsonOutputParser
from app.llm.providers import LLMFactory
from app.llm.prompts import PromptBuilder

logger = logging.getLogger(__name__)

class ExtractedScheme(BaseModel):
    is_valid_scheme: bool = Field(description="True if the text describes a specific government scheme, false otherwise.")
    title: str = Field(description="Clean, concise title of the scheme.")
    ministry: str = Field(description="The responsible ministry or state government.")
    eligibility_summary: str = Field(description="Concise summary of eligibility.")
    benefits: List[str] = Field(description="List of up to 4 distinct benefits.")

class SchemeExtractor:
    """
    Uses an LLM to extract structured scheme data from raw web content.
    """
    def __init__(self, provider_name: str = "groq", model_name: Optional[str] = None):
        # We can use a fast model for extraction
        self.llm = LLMFactory.get_provider(provider_name, model_name)
        
        self.parser = JsonOutputParser(pydantic_object=ExtractedScheme)
        
        self.prompt = PromptTemplate(
            template=PromptBuilder.SCHEME_EXTRACTION_TEMPLATE + "\n{format_instructions}",
            input_variables=["text"],
            partial_variables={"format_instructions": self.parser.get_format_instructions()},
        )
        
        self.chain = self.prompt | self.llm | self.parser

    async def extract(self, text: str) -> Optional[ExtractedScheme]:
        """
        Extracts structured data from raw text.
        Returns an ExtractedScheme object, or None if extraction fails.
        """
        if not text or len(text.strip()) < 50:
            return None
            
        try:
            # We truncate text to roughly 3000 words to avoid context limits
            # and excessive token usage for extraction
            truncated_text = text[:15000]
            
            result = await self.chain.ainvoke({"text": truncated_text})
            
            # The parser returns a dict matching the Pydantic schema
            extracted = ExtractedScheme(**result)
            return extracted
            
        except Exception as e:
            logger.error(f"Failed to extract scheme data using LLM: {e}")
            return None
