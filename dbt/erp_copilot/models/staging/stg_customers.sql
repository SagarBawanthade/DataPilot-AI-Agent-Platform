select
    customer_id,
    customer_name,
    customer_email,
    customer_city,
    customer_country,
    created_at
from {{ source('raw', 'CUSTOMERS') }}