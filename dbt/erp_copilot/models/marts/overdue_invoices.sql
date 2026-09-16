SELECT
    invoice_id,
    customer_id,
    amount,
    due_date,
    status
FROM {{ ref('stg_invoices') }}
WHERE status = 'overdue'