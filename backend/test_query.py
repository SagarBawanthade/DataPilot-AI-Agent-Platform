from analytics.services.snowflake_client import get_top_customers

results = get_top_customers()

for row in results:
    print(row)