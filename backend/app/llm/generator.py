import os
import logging
from typing import AsyncGenerator, Optional, Dict
from langchain_core.output_parsers import StrOutputParser
from langchain_core.runnables import RunnablePassthrough
from langchain_community.chat_message_histories import SQLChatMessageHistory
from langchain_core.runnables.history import RunnableWithMessageHistory
from langchain_core.messages import get_buffer_string, HumanMessage, AIMessage
from app.llm.providers import LLMFactory
from app.llm.prompts import PromptBuilder
from app.rag.retriever import Retriever
from app.models.user import UserProfile

logger = logging.getLogger(__name__)

# Build absolute path for the SQLite database so it works regardless of CWD
_BACKEND_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
_DATA_DIR = os.path.join(_BACKEND_DIR, "data")
os.makedirs(_DATA_DIR, exist_ok=True)
_DB_PATH = os.path.join(_DATA_DIR, "chat_history.db")
_DB_URL = f"sqlite:///{_DB_PATH.replace(os.sep, '/')}"

# Multilingual fallback messages — returned when no context is found.
# This ensures the user sees a response in their selected language instead
# of always English, which is critical for JanMitra's multilingual mission.
_NO_CONTEXT_MESSAGES: Dict[str, str] = {
    "English": "I couldn't find this information on any verified official government website.",
    "Hindi": "मुझे किसी भी सत्यापित आधिकारिक सरकारी वेबसाइट पर यह जानकारी नहीं मिल सकी।",
    "Marathi": "मला कोणत्याही सत्यापित अधिकृत सरकारी वेबसाइटवर ही माहिती सापडली नाही.",
    "Tamil": "சரிபார்க்கப்பட்ட அதிகாரப்பூர்வ அரசு வலைத்தளத்தில் இந்தத் தகவலை என்னால் கண்டறிய இயலவில்லை.",
    "Telugu": "ధృవీకరించబడిన అధికారిక ప్రభుత్వ వెబ్‌సైట్‌లో నేను ఈ సమాచారాన్ని కనుగొనలేకపోయాను.",
    "Kannada": "ಪರಿಶೀಲಿಸಿದ ಅಧಿಕೃತ ಸರ್ಕಾರಿ ವೆಬ್‌ಸೈಟ್‌ನಲ್ಲಿ ಈ ಮಾಹಿತಿಯನ್ನು ನನಗೆ ಕಂಡುಹಿಡಿಯಲಾಗಲಿಲ್ಲ.",
    "Bengali": "কোনো যাচাইকৃত সরকারি ওয়েবসাইটে আমি এই তথ্য খুঁজে পাইনি।",
}


def _get_no_context_message(language: str) -> str:
    """Return a 'no context found' message in the user's selected language."""
    return _NO_CONTEXT_MESSAGES.get(language, _NO_CONTEXT_MESSAGES["English"])


def get_session_history(session_id: str):
    return SQLChatMessageHistory(
        session_id=session_id,
        connection=f"sqlite:///{_DB_PATH.replace(os.sep, '/')}",
        async_mode=False
    )

class Generator:
    """
    Uses LangChain Expression Language (LCEL) to combine the PromptBuilder, 
    LLM Provider, and retriever to generate or stream the final response.
    """
    def __init__(self, provider_name: str = "groq", model_name: str = None):
        self.llm = LLMFactory.get_provider(provider_name, model_name)
        self.retriever_wrapper = Retriever()
        self.prompt = PromptBuilder.get_rag_prompt()
        self.rephrase_prompt = PromptBuilder.get_rephrase_prompt()
        self.output_parser = StrOutputParser()
        
        # Wrapped main chain with memory
        chain = self.prompt | self.llm | self.output_parser
        self.chain_with_history = RunnableWithMessageHistory(
            chain,
            get_session_history,
            input_messages_key="query",
            history_messages_key="chat_history",
        )

    async def _get_search_query(self, query: str, session_id: str) -> str:
        history = get_session_history(session_id)
        try:
            msgs = await history.aget_messages()
        except Exception:
            msgs = []
            
        if len(msgs) > 0:
            rephrase_chain = self.rephrase_prompt | self.llm | self.output_parser
            search_query = await rephrase_chain.ainvoke({
                "chat_history": get_buffer_string(msgs[-6:]),
                "query": query
            })
            logger.info("Rephrased Query: %s", search_query)
            return search_query
        return query

    async def generate_response(self, query: str, user_profile: Optional[UserProfile] = None, language: str = "English", session_id: Optional[str] = None) -> str:
        session_id_val = session_id or "default"
        search_query = await self._get_search_query(query, session_id_val)
        
        context_str = await self.retriever_wrapper.retrieve_context(search_query, user_profile, session_id=session_id)
        
        if not context_str.strip():
            # Return the fallback message in the user's selected language
            fallback = _get_no_context_message(language)
            history = get_session_history(session_id_val)
            await history.aadd_messages([
                HumanMessage(content=query),
                AIMessage(content=fallback)
            ])
            return fallback
            
        profile_str = "No profile details provided."
        if user_profile:
            parts = []
            if user_profile.state: parts.append(f"State: {user_profile.state}")
            if user_profile.category: parts.append(f"Category: {user_profile.category}")
            if user_profile.age: parts.append(f"Age: {user_profile.age}")
            if user_profile.gender: parts.append(f"Gender: {user_profile.gender}")
            if user_profile.income: parts.append(f"Income: {user_profile.income}")
            if user_profile.occupation: parts.append(f"Occupation: {user_profile.occupation}")
            if user_profile.education: parts.append(f"Education: {user_profile.education}")
            profile_str = ", ".join(parts) if parts else profile_str

        return await self.chain_with_history.ainvoke(
            {"context": context_str, "query": query, "language": language, "user_profile": profile_str},
            config={"configurable": {"session_id": session_id_val}}
        )

    async def stream_response(self, query: str, user_profile: Optional[UserProfile] = None, language: str = "English", session_id: Optional[str] = None) -> AsyncGenerator[str, None]:
        session_id_val = session_id or "default"
        search_query = await self._get_search_query(query, session_id_val)
        
        context_str = await self.retriever_wrapper.retrieve_context(search_query, user_profile, session_id=session_id)
        
        if not context_str.strip():
            # Return the fallback message in the user's selected language
            fallback = _get_no_context_message(language)
            history = get_session_history(session_id_val)
            await history.aadd_messages([
                HumanMessage(content=query),
                AIMessage(content=fallback)
            ])
            yield fallback
            return
            
        profile_str = "No profile details provided."
        if user_profile:
            parts = []
            if user_profile.state: parts.append(f"State: {user_profile.state}")
            if user_profile.category: parts.append(f"Category: {user_profile.category}")
            if user_profile.age: parts.append(f"Age: {user_profile.age}")
            if user_profile.gender: parts.append(f"Gender: {user_profile.gender}")
            if user_profile.income: parts.append(f"Income: {user_profile.income}")
            if user_profile.occupation: parts.append(f"Occupation: {user_profile.occupation}")
            if user_profile.education: parts.append(f"Education: {user_profile.education}")
            profile_str = ", ".join(parts) if parts else profile_str
            
        async for chunk in self.chain_with_history.astream(
            {"context": context_str, "query": query, "language": language, "user_profile": profile_str},
            config={"configurable": {"session_id": session_id_val}}
        ):
            yield chunk


# ---------------------------------------------------------------------------
# Module-level singleton — avoids re-creating the Generator (and its LLM
# client, Retriever, LCEL chain, etc.) on every single API request.
# This is critical for Render free tier where cold-start latency matters.
# ---------------------------------------------------------------------------
_generator_instance: Optional[Generator] = None


def get_generator(provider_name: str = "groq", model_name: str = None) -> Generator:
    """
    Return a lazily-initialized, reusable Generator singleton.
    Call this from API endpoints instead of ``Generator()``.
    """
    global _generator_instance
    if _generator_instance is None:
        logger.info("Initializing Generator singleton (provider=%s)...", provider_name)
        _generator_instance = Generator(provider_name=provider_name, model_name=model_name)
    return _generator_instance

