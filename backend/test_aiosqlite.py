import asyncio
import os
from langchain_community.chat_message_histories import SQLChatMessageHistory

_DB_PATH = os.path.abspath("test_history.db")
_DB_URL = f"sqlite+aiosqlite:///{_DB_PATH.replace(os.sep, '/')}"

async def main():
    print(f"Connecting to {_DB_URL}")
    history = SQLChatMessageHistory(
        session_id="test1",
        connection_string=_DB_URL,
        async_mode=True
    )
    print("Calling aget_messages()...")
    msgs = await history.aget_messages()
    print(f"Got {len(msgs)} messages.")
    
if __name__ == "__main__":
    asyncio.run(main())
