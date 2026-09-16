from google import genai
from dotenv import load_dotenv
import os

load_dotenv()

client = genai.Client(
    api_key=os.getenv("GEMINI_API_KEY")
)


def classify_question(question):
    try:

        prompt = f"""
Classify the user question into ONE label.

Labels:

top_customers
monthly_revenue
inventory_health
overdue_invoices

Question:
{question}

Return ONLY label.
"""

        response = client.models.generate_content(
            model="gemini-3.6-flash",
            contents=prompt
        )

        return response.text.strip()

    except Exception:
        return fallback_intent(question)


def summarize_results(question, data):

    try:

        prompt = f"""
You are an ERP analytics assistant.

User Question:
{question}

Data:
{data}

Write a concise business summary.

Do NOT output JSON.

Keep it under 150 words.
"""

        response = client.models.generate_content(
            model="gemini-3.6-flash",
            contents=prompt
        )

        return response.text

    except Exception:

        return "Summary unavailable. Showing raw data."


def fallback_intent(question):

    q = question.lower()

    if "customer" in q:
        return "top_customers"

    if "revenue" in q:
        return "monthly_revenue"

    if "inventory" in q or "stock" in q:
        return "inventory_health"

    if "invoice" in q:
        return "overdue_invoices"

    return "unknown"