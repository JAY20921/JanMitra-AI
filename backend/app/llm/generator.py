from typing import AsyncGenerator, Optional, Dict
from langchain_core.output_parsers import StrOutputParser
from langchain_core.runnables import RunnablePassthrough
from langchain_community.chat_message_histories import SQLChatMessageHistory
from langchain_core.runnables.history import RunnableWithMessageHistory
from langchain_core.messages import get_buffer_string
from app.llm.providers import LLMFactory
from app.llm.prompts import PromptBuilder
from app.rag.retriever import Retriever
from app.models.user import UserProfile

def get_session_history(session_id: str):
    return SQLChatMessageHistory(
        session_id=session_id,
        connection_string="sqlite+aiosqlite:///chat_history.db",
        async_mode=True
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
            print(f"Rephrased Query: {search_query}")
            return search_query
        return query

    async def generate_response(self, query: str, user_profile: Optional[UserProfile] = None, language: str = "English", session_id: Optional[str] = None) -> str:
        session_id_val = session_id or "default"
        search_query = await self._get_search_query(query, session_id_val)
        
        context_str = await self.retriever_wrapper.retrieve_context(search_query, user_profile, session_id=session_id)
        
        if not context_str.strip():
            # Manually append the failed turn to history so we don't break continuity
            history = get_session_history(session_id_val)
            from langchain_core.messages import HumanMessage, AIMessage
            await history.aadd_messages([
                HumanMessage(content=query),
                AIMessage(content="I couldn't find this information on any verified official government website.")
            ])
            return "I couldn't find this information on any verified official government website."
            
        return await self.chain_with_history.ainvoke(
            {"context": context_str, "query": query, "language": language},
            config={"configurable": {"session_id": session_id_val}}
        )

    async def stream_response(self, query: str, user_profile: Optional[UserProfile] = None, language: str = "English", session_id: Optional[str] = None) -> AsyncGenerator[str, None]:
        session_id_val = session_id or "default"
        search_query = await self._get_search_query(query, session_id_val)
        
        context_str = await self.retriever_wrapper.retrieve_context(search_query, user_profile, session_id=session_id)
        
        if not context_str.strip():
            history = get_session_history(session_id_val)
            from langchain_core.messages import HumanMessage, AIMessage
            await history.aadd_messages([
                HumanMessage(content=query),
                AIMessage(content="I couldn't find this information on any verified official government website.")
            ])
            yield "I couldn't find this information on any verified official government website."
            return
            
        async for chunk in self.chain_with_history.astream(
            {"context": context_str, "query": query, "language": language},
            config={"configurable": {"session_id": session_id_val}}
        ):
            yield chunk
