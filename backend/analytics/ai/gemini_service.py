from dotenv import load_dotenv
from google import genai
import os

load_dotenv()

client = genai.Client(
    api_key=os.getenv("GEMINI_API_KEY")
)

def classify_question(question):

    prompt = f"""
You are an ERP analytics assistant.

Classify the user question into one of:

top_customers
monthly_revenue
inventory_health
overdue_invoices

Return ONLY the label.

Question:
{question}
"""

    response = client.models.generate_content(
        model="gemini-3.6-flash",
        contents=prompt
    )

    return response.text.strip()


def summarize_results(question, data):

    prompt = f"""
You are an ERP Analytics Copilot.

Question:
{question}

Data:
{data}

Provide a short business summary.
"""
    
    response = client.models.generate_content(
        model="gemini-3.6-flash",
        contents=prompt
    )

    return response.text.strip()