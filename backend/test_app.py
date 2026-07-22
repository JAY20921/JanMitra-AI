import sys
import os

# Add the backend directory to sys.path
sys.path.insert(0, os.path.abspath(os.path.dirname(__file__)))

try:
    from app.main import create_app
    app = create_app()
    print("FastAPI app instantiated successfully!")
    from app.llm.providers import LLMFactory
    groq_llm = LLMFactory.get_provider("groq")
    print("Groq LLM provider instantiated successfully:", type(groq_llm))
except Exception as e:
    import traceback
    print("Error initializing app or providers:")
    traceback.print_exc()
