from django.urls import path

from .views import (
    top_customers,
    monthly_revenue,
    inventory_health,
    overdue_invoices
)

urlpatterns = [
    path("customers/top/", top_customers),

    path(
        "revenue/monthly/",
        monthly_revenue
    ),

    path(
        "inventory/health/",
        inventory_health
    ),

    path(
        "invoices/overdue/",
        overdue_invoices
    ),
]