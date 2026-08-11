import asyncio
import json
import os
import sys

# Ensure the backend directory is in sys.path
sys.path.append(
    os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
)

from app.rag.retriever import Retriever
from app.llm.generator import Generator
from langchain_core.prompts import PromptTemplate
from langchain_groq import ChatGroq
from app.core.config import settings
from app.models.user import UserProfile


# We'll use LLM-as-a-judge (Groq 8b to avoid rate limits)
def get_evaluator_llm():
    return ChatGroq(
        model="llama-3.1-8b-instant",
        temperature=0.0,
        groq_api_key=settings.GROQ_API_KEY,
    )


# Evaluation Prompts
EVAL_PROMPT = PromptTemplate.from_template("""
You are an expert evaluator for a Retrieval-Augmented Generation (RAG) system.
Please evaluate the following test case on a scale of 1 to 5 for three metrics:
1. Context Relevance: Did the retrieved context contain information highly relevant to the query?
2. Faithfulness: Is the generated answer completely supported by the retrieved context? (No hallucinations)
3. Answer Relevance: Does the generated answer directly address the user's query and contain the expected info?

---
User Query: {query}
Expected Info: {expected_info}

Retrieved Context:
{context}

Generated Answer:
{answer}
---

Output your evaluation strictly in the following JSON format:
{{
  "context_relevance_score": <1-5>,
  "faithfulness_score": <1-5>,
  "answer_relevance_score": <1-5>,
  "reasoning": "<short explanation for the scores>"
}}
""")


async def evaluate_query(query_data, retriever, generator, evaluator_llm):
    query = query_data["query"]
    expected_info = query_data["expected_info"]
    profile_data = query_data.get("user_profile", {})
    user_profile = UserProfile(**profile_data)

    print(f"\nEvaluating Query: '{query}'")

    # 1. Retrieve Context
    context = await retriever.retrieve_context(query, user_profile)
    if not context.strip():
        context = "No context retrieved."

    # 2. Generate Answer
    answer = await generator.generate_response(
        query, user_profile, session_id="eval-session"
    )

    # 3. Evaluate using LLM-as-a-judge
    prompt_str = EVAL_PROMPT.format(
        query=query, expected_info=expected_info, context=context, answer=answer
    )

    try:
        eval_result_raw = await evaluator_llm.ainvoke(prompt_str)
        # Parse JSON from response
        text_content = eval_result_raw.content
        # Find JSON block
        if "```json" in text_content:
            json_str = text_content.split("```json")[1].split("```")[0].strip()
        elif "```" in text_content:
            json_str = text_content.split("```")[1].split("```")[0].strip()
        else:
            json_str = text_content.strip()

        eval_dict = json.loads(json_str)
    except Exception as e:
        print(f"Error parsing evaluator response: {e}")
        eval_dict = {
            "context_relevance_score": 0,
            "faithfulness_score": 0,
            "answer_relevance_score": 0,
            "reasoning": f"Evaluation failed: {str(e)}",
        }

    eval_dict["query"] = query
    return eval_dict


async def run_evaluation():
    dataset_path = os.path.join(
        os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))),
        "data",
        "eval_dataset.json",
    )
    if not os.path.exists(dataset_path):
        print(f"Dataset not found at {dataset_path}")
        return

    with open(dataset_path, "r", encoding="utf-8") as f:
        dataset = json.load(f)

    retriever = Retriever()
    generator = Generator()
    evaluator_llm = get_evaluator_llm()

    results = []
    total_context = 0
    total_faithfulness = 0
    total_answer = 0

    print(f"Starting evaluation of {len(dataset)} queries...\n")

    for item in dataset:
        res = await evaluate_query(item, retriever, generator, evaluator_llm)
        results.append(res)

        c_score = res.get("context_relevance_score", 0)
        f_score = res.get("faithfulness_score", 0)
        a_score = res.get("answer_relevance_score", 0)

        total_context += c_score
        total_faithfulness += f_score
        total_answer += a_score

        print(
            f"Scores -> Context: {c_score}/5 | Faithfulness: {f_score}/5 | Answer: {a_score}/5"
        )
        print(f"Reasoning: {res.get('reasoning', '')}")

    num_queries = len(dataset)
    avg_context = total_context / num_queries if num_queries > 0 else 0
    avg_faithfulness = total_faithfulness / num_queries if num_queries > 0 else 0
    avg_answer = total_answer / num_queries if num_queries > 0 else 0

    # Write Markdown Report
    report_path = os.path.join(
        os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))),
        "eval_report.md",
    )
    with open(report_path, "w", encoding="utf-8") as f:
        f.write("# RAG Evaluation Report\n\n")
        f.write("## Aggregate Metrics\n")
        f.write(f"- **Average Context Relevance:** {avg_context:.2f} / 5.0\n")
        f.write(
            f"- **Average Faithfulness (Zero Hallucinations):** {avg_faithfulness:.2f} / 5.0\n"
        )
        f.write(f"- **Average Answer Relevance:** {avg_answer:.2f} / 5.0\n\n")

        f.write("## Detailed Results\n")
        for r in results:
            f.write(f"### Query: {r['query']}\n")
            f.write(f"- **Context Score:** {r.get('context_relevance_score')}\n")
            f.write(f"- **Faithfulness Score:** {r.get('faithfulness_score')}\n")
            f.write(f"- **Answer Score:** {r.get('answer_relevance_score')}\n")
            f.write(f"- **Reasoning:** {r.get('reasoning')}\n\n")

    print(f"\nEvaluation complete! Report saved to {report_path}")


if __name__ == "__main__":
    # Workaround for ProactorEventLoop issue on Windows
    if sys.platform.startswith("win"):
        asyncio.set_event_loop_policy(asyncio.WindowsSelectorEventLoopPolicy())
    asyncio.run(run_evaluation())
