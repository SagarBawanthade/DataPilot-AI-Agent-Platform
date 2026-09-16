from rest_framework.response import Response
from rest_framework.decorators import api_view

from analytics.services.snowflake_client import (
    get_top_customers,
    get_monthly_revenue,
    get_inventory_health,
    get_overdue_invoices
)


@api_view(["GET"])
def top_customers(request):
    return Response(get_top_customers())


@api_view(["GET"])
def monthly_revenue(request):
    return Response(get_monthly_revenue())


@api_view(["GET"])
def inventory_health(request):
    return Response(get_inventory_health())


@api_view(["GET"])
def overdue_invoices(request):
    return Response(get_overdue_invoices())