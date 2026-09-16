select
    invoice_id,
    customer_id,
    amount,
    due_date,
    status

from {{ ref('stg_invoices') }}

where status = 'overdue'