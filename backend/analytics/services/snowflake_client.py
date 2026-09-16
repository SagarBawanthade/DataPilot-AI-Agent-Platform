import os
from dotenv import load_dotenv
import snowflake.connector

load_dotenv()


def get_connection():
    return snowflake.connector.connect(
        account=os.getenv("SNOWFLAKE_ACCOUNT"),
        user=os.getenv("SNOWFLAKE_USER"),
        password=os.getenv("SNOWFLAKE_PASSWORD"),
        warehouse=os.getenv("SNOWFLAKE_WAREHOUSE"),
        database=os.getenv("SNOWFLAKE_DATABASE"),
        schema=os.getenv("SNOWFLAKE_SCHEMA"),
        role=os.getenv("SNOWFLAKE_ROLE"),
    )





def run_query(query):
    conn = get_connection()
    cur = conn.cursor()

    cur.execute(query)

    columns = [col[0] for col in cur.description]

    results = [
        dict(zip(columns, row))
        for row in cur.fetchall()
    ]

    cur.close()
    conn.close()

    return results


def get_top_customers():
    return run_query("""
        SELECT *
        FROM CUSTOMER_REVENUE
        ORDER BY TOTAL_REVENUE DESC
        LIMIT 10
    """)


def get_monthly_revenue():
    return run_query("""
        SELECT *
        FROM MONTHLY_REVENUE
        ORDER BY REVENUE_MONTH DESC
    """)


def get_inventory_health():
    return run_query("""
        SELECT *
        FROM INVENTORY_HEALTH
    """)


def get_overdue_invoices():
    return run_query("""
        SELECT *
        FROM OVERDUE_INVOICES
    """)