select
    date_trunc('month', order_date) as revenue_month,
    sum(total_amount) as revenue

from {{ ref('stg_orders') }}

where status = 'completed'

group by 1
order by 1