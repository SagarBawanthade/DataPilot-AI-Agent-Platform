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


def get_top_customers(limit=10):
    conn = get_connection()

    try:
        cursor = conn.cursor()

        query = f"""
        SELECT *
        FROM CUSTOMER_REVENUE
        ORDER BY TOTAL_REVENUE DESC
        LIMIT {limit}
        """

        cursor.execute(query)

        columns = [col[0] for col in cursor.description]

        results = [
            dict(zip(columns, row))
            for row in cursor.fetchall()
        ]

        return results

    finally:
        conn.close()