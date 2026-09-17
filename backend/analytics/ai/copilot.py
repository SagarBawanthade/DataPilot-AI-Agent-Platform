from analytics.ai.gemini_service import (
    classify_question,
    summarize_results
)

from analytics.services.snowflake_client import (
    get_top_customers,
    get_monthly_revenue,
    get_inventory_health,
    get_overdue_invoices,
)


def answer_question(question):
    intent = classify_question(question)
    print("Classified Intent:", intent)

    if intent == "greeting":
        return {
            "answer": (
                "Hello! I am your **DataPilot ERP Copilot**.\n\n"
                "I can analyze live business data directly from your Snowflake data warehouse. "
                "Here are some questions you can ask me:\n\n"
                "• **Top Customers**: *'Who are my top customers?'*\n"
                "• **Monthly Revenue**: *'Show monthly revenue trends'*\n"
                "• **Inventory Health**: *'Which products are low on stock?'*\n"
                "• **Overdue Invoices**: *'Are there any overdue invoices?'*"
            ),
            "data": []
        }

    try:
        if intent == "top_customers":
            data = get_top_customers()
            return {
                "answer": summarize_results(question, data),
                "data": data
            }

        if intent == "monthly_revenue":
            data = get_monthly_revenue()
            return {
                "answer": summarize_results(question, data),
                "data": data
            }

        if intent == "inventory_health":
            data = get_inventory_health()
            return {
                "answer": summarize_results(question, data),
                "data": data
            }

        if intent == "overdue_invoices":
            data = get_overdue_invoices()
            return {
                "answer": summarize_results(question, data),
                "data": data
            }

    except Exception as e:
        print(f"[Copilot Query Error] {e}")
        return {
            "answer": f"An error occurred while querying Snowflake: {e}",
            "data": []
        }

    return {
        "answer": (
            "I could not match your query to a supported ERP data mart. "
            "Please try asking about:\n\n"
            "• **Top Customers** (e.g. *'Who are my best customers?'*)\n"
            "• **Monthly Revenue** (e.g. *'Show monthly revenue'*)\n"
            "• **Inventory Health** (e.g. *'Which products need restocking?'*)\n"
            "• **Overdue Invoices** (e.g. *'Any overdue invoices?'*)"
        ),
        "data": []
    }