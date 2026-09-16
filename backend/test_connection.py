
from analytics.services.snowflake_client import get_connection

conn = get_connection()

print("Connected!")

conn.close()