from analytics.services.snowflake_client import (
    get_top_customers,
    get_monthly_revenue,
    get_inventory_health,
    get_overdue_invoices,
)


def answer_question(question: str):

    question = question.lower()

    if "customer" in question:
        return get_top_customers()

    if "revenue" in question:
        return get_monthly_revenue()

    if "inventory" in question or "stock" in question:
        return get_inventory_health()

    if "invoice" in question:
        return get_overdue_invoices()

    return {
        "message": "I don't understand the question yet."
    }