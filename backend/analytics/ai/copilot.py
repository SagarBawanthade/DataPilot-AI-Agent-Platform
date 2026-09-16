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

    print("Intent:", intent)

    if intent == "top_customers":

        data = get_top_customers()

        summary = summarize_results(
            question,
            data
        )

        return {
            "answer": summary,
            "data": data
        }

    if intent == "monthly_revenue":

        data = get_monthly_revenue()

        summary = summarize_results(
            question,
            data
        )

        return {
            "answer": summary,
            "data": data
        }

    if intent == "inventory_health":

        data = get_inventory_health()

        summary = summarize_results(
            question,
            data
        )

        return {
            "answer": summary,
            "data": data
        }

    if intent == "overdue_invoices":

        data = get_overdue_invoices()

        summary = summarize_results(
            question,
            data
        )

        return {
            "answer": summary,
            "data": data
        }

    return {
        "message": "Could not understand question"
    }