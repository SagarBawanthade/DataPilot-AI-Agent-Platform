from analytics.services.snowflake_client import (
    get_top_customers,
    get_monthly_revenue,
    get_inventory_health,
    get_overdue_invoices,
)


def answer_question(question: str):
    q = (question or "").strip().lower()

    if any(k in q for k in ["customer", "client", "account", "buyer"]):
        return get_top_customers()

    if any(k in q for k in ["revenue", "sales", "turnover", "income", "earning", "growth"]):
        return get_monthly_revenue()

    if any(k in q for k in ["inventory", "stock", "product", "sku", "reorder", "warehouse"]):
        return get_inventory_health()

    if any(k in q for k in ["invoice", "debt", "overdue", "bill", "unpaid", "receivable", "delinquent"]):
        return get_overdue_invoices()

    if any(k in q for k in ["hello", "hi", "hey", "help", "who are you", "what can you do"]):
        return {
            "message": "👋 Hello! I am your DataPilot ERP AI Copilot, connected to your Snowflake Data Warehouse. You can ask me questions such as:\n\n• \"Show me top 10 enterprise customers\"\n• \"What is our monthly revenue breakdown?\"\n• \"Which inventory items need reordering?\"\n• \"List all overdue customer invoices\""
        }

    return {
        "message": "I didn't quite catch that query. You can ask me about:\n\n• Top Enterprise Customers (e.g. \"Who are our top customers?\")\n• Monthly Revenue (e.g. \"Show monthly revenue trends\")\n• Inventory Health (e.g. \"Check stock levels and reorders\")\n• Overdue Invoices (e.g. \"Show overdue invoices\")"
    }