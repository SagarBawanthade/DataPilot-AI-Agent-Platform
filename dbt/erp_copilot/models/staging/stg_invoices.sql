select
    invoice_id,
    customer_id,
    invoice_date,
    due_date,
    amount,
    status
from {{ source('raw', 'INVOICES') }}