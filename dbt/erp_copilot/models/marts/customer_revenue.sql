select
    c.customer_id,
    c.customer_name,
    count(distinct o.order_id) as total_orders,
    sum(o.total_amount) as total_revenue

from {{ ref('stg_customers') }} c

join {{ ref('stg_orders') }} o
    on c.customer_id = o.customer_id

where o.status = 'completed'

group by
    c.customer_id,
    c.customer_name