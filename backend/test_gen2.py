import asyncio
from app.llm.generator import Generator

async def main():
    g = Generator('gemini')
    r = await g.generate_response("Engineering student looking for government scholarships", session_id="test_gemini2")
    print("GEMINI:", r)
    g2 = Generator('groq')
    r2 = await g2.generate_response("Engineering student looking for government scholarships", session_id="test_groq2")
    print("GROQ:", r2)

if __name__ == "__main__":
    asyncio.run(main())
