from google import genai
from dotenv import load_dotenv
import os

load_dotenv()

client = genai.Client(
    api_key=os.getenv("GEMINI_API_KEY")
)


# Ordered cascade: Fast, high-quota models first
FALLBACK_MODELS = [
    "gemini-3.5-flash-lite",
    "gemini-flash-latest",
    "gemini-flash-lite-latest",
    "gemini-3.5-flash",
]


def classify_question(question):
    # Step 1: Fast zero-quota keyword classification
    quick_intent = fallback_intent(question)
    if quick_intent != "unknown":
        return quick_intent

    # Step 2: Use LLM for conversational or complex phrasing
    valid_labels = {"greeting", "top_customers", "monthly_revenue", "inventory_health", "overdue_invoices", "unknown"}

    prompt = f"""
Classify the user question into EXACTLY ONE label from the list below:

Labels:
greeting
top_customers
monthly_revenue
inventory_health
overdue_invoices
unknown

Classification Guide:
- greeting: user is saying hi, hello, hey, asking who you are, or asking for help / capabilities.
- top_customers: user asks about top customers, highest revenue clients, best accounts, or customer sales rankings.
- monthly_revenue: user asks about monthly revenue, sales over time, earnings trends, or monthly performance.
- inventory_health: user asks about inventory, stock levels, out-of-stock items, or low stock products.
- overdue_invoices: user asks about overdue invoices, late payments, unpaid bills, or collection status.
- unknown: any query that doesn't relate to the above topics.

User Question:
{question}

Return ONLY the label.
"""

    for model in FALLBACK_MODELS:
        try:
            response = client.models.generate_content(
                model=model,
                contents=prompt
            )
            label = response.text.strip().lower()
            if label in valid_labels:
                return label
        except Exception as e:
            print(f"[{model} Classifier Error] {e}")
            continue

    return "unknown"


def summarize_results(question, data):
    total_records = len(data) if isinstance(data, list) else 0
    sample_data = data[:15] if isinstance(data, list) and len(data) > 15 else data

    prompt = f"""
You are an ERP analytics assistant.

User Question:
{question}

Total Records in Snowflake: {total_records}
Sample Data:
{sample_data}

Write a concise business summary answering the user question.
Highlight key figures, top metrics, or urgent items.
Do NOT output JSON.
Keep it under 150 words.
"""

    # Try models in cascade order
    for model in FALLBACK_MODELS:
        try:
            response = client.models.generate_content(
                model=model,
                contents=prompt
            )
            text = response.text.strip()
            if text:
                return text
        except Exception as e:
            print(f"[{model} Summarizer Error] {e}")
            continue

    # Fallback to local heuristic analytics engine if all LLM models are unavailable
    return generate_heuristic_summary(question, data)


def generate_heuristic_summary(question, data):
    if not data or not isinstance(data, list):
        return "No records were found matching your query."

    first = data[0]

    # Top Customers
    if "CUSTOMER_NAME" in first and "TOTAL_REVENUE" in first:
        top_name = first.get("CUSTOMER_NAME", "Unknown")
        top_rev = float(first.get("TOTAL_REVENUE", 0))
        total_rev_all = sum(float(r.get("TOTAL_REVENUE", 0)) for r in data)
        return (
            f"Your top customer is **{top_name}** with **₹{top_rev:,.2f}** in total revenue "
            f"across {first.get('TOTAL_ORDERS', 0)} orders. "
            f"The top {len(data)} accounts combined generate **₹{total_rev_all:,.2f}** in total sales."
        )

    # Monthly Revenue
    if "REVENUE_MONTH" in first and "REVENUE" in first:
        sorted_rev = sorted(data, key=lambda r: float(r.get("REVENUE", 0)), reverse=True)
        peak = sorted_rev[0]
        latest = data[0]
        return (
            f"Across {len(data)} recorded months, peak revenue was **₹{float(peak.get('REVENUE', 0)):,.2f}** "
            f"in **{peak.get('REVENUE_MONTH')}** ({peak.get('TOTAL_ORDERS', 0)} orders). "
            f"The latest month ({latest.get('REVENUE_MONTH')}) reached **₹{float(latest.get('REVENUE', 0)):,.2f}**."
        )

    # Inventory Health
    if "STOCK_STATUS" in first:
        reorder_items = [r for r in data if str(r.get("STOCK_STATUS")).upper() == "REORDER"]
        healthy_count = len(data) - len(reorder_items)
        if reorder_items:
            critical_names = ", ".join(f"'{r.get('PRODUCT_NAME')}' ({r.get('CURRENT_STOCK')} in stock)" for r in reorder_items[:3])
            return (
                f"Out of {len(data)} inventory products tracked, **{len(reorder_items)} items** are flagged for **REORDER**: {critical_names}. "
                f"The remaining {healthy_count} items are at healthy stock levels."
            )
        return f"All {len(data)} monitored products currently have healthy stock levels."

    # Overdue Invoices
    if "AMOUNT" in first and "STATUS" in first:
        total_overdue = sum(float(r.get("AMOUNT", 0)) for r in data)
        sorted_invoices = sorted(data, key=lambda r: float(r.get("AMOUNT", 0)), reverse=True)
        highest = sorted_invoices[0]
        return (
            f"There are **{len(data)} overdue invoices** totaling **₹{total_overdue:,.2f}** requiring collection. "
            f"The largest single overdue balance is Invoice #{highest.get('INVOICE_ID')} (Customer {highest.get('CUSTOMER_ID')}) "
            f"for **₹{float(highest.get('AMOUNT', 0)):,.2f}** (Due: {highest.get('DUE_DATE')}). Immediate follow-up is recommended."
        )

    return f"Retrieved {len(data)} records from Snowflake data mart."


def fallback_intent(question):
    q = question.lower().strip()

    greetings = ["hi", "hello", "hey", "help", "who are you", "what can you do", "good morning", "good evening", "greetings"]
    if any(q.startswith(g) or q == g for g in greetings) or "what can you do" in q:
        return "greeting"

    if "customer" in q or "client" in q:
        return "top_customers"

    if "revenue" in q or "sale" in q or "earning" in q or "income" in q:
        return "monthly_revenue"

    if "inventory" in q or "stock" in q:
        return "inventory_health"

    if "invoice" in q or "bill" in q or "overdue" in q or "unpaid" in q:
        return "overdue_invoices"

    return "unknown"