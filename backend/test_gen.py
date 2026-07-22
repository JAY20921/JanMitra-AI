import asyncio
from app.llm.generator import Generator

async def main():
    g = Generator('groq')
    r = await g.generate_response("I'm a farmer with 2 acres of land. What schemes am I eligible for?", session_id="test_groq")
    print(r)

if __name__ == "__main__":
    asyncio.run(main())
