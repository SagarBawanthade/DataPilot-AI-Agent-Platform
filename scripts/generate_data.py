from faker import Faker
import pandas as pd
import random
from pathlib import Path

fake = Faker()

# Configuration
NUM_CUSTOMERS = 100
NUM_PRODUCTS = 50
NUM_ORDERS = 500
BASE_DIR = Path(__file__).resolve().parent.parent

output_dir = BASE_DIR / "data" / "sample_data"
output_dir.mkdir(parents=True, exist_ok=True)

# ------------------------
# Customers
# ------------------------

customers = []

for customer_id in range(1, NUM_CUSTOMERS + 1):
    customers.append({
        "customer_id": customer_id,
        "customer_name": fake.company(),
        "customer_email": fake.company_email(),
        "customer_city": fake.city(),
        "customer_country": fake.country(),
        "created_at": fake.date_time_this_decade()
    })

customers_df = pd.DataFrame(customers)
customers_df.to_csv(output_dir / "customers.csv", index=False)

print(f"Generated {len(customers_df)} customers")


# ------------------------
# Products
# ------------------------

categories = [
    "Electronics",
    "Software",
    "Hardware",
    "Services",
    "Accessories"
]

products = []

for product_id in range(1, NUM_PRODUCTS + 1):
    products.append({
        "product_id": product_id,
        "product_name": fake.word().title(),
        "category": random.choice(categories),
        "unit_price": round(random.uniform(100, 10000), 2),
        "reorder_level": random.randint(10, 50),
        "created_at": fake.date_time_this_decade()
    })

products_df = pd.DataFrame(products)
products_df.to_csv(output_dir / "products.csv", index=False)

print(f"Generated {len(products_df)} products")


# ------------------------
# Orders
# ------------------------

orders = []

for order_id in range(1, NUM_ORDERS + 1):
    orders.append({
        "order_id": order_id,
        "customer_id": random.randint(1, NUM_CUSTOMERS),
        "order_date": fake.date_between(start_date="-2y", end_date="today"),
        "status": random.choice(
            ["completed", "pending", "cancelled"]
        ),
        "total_amount": 0
    })

orders_df = pd.DataFrame(orders)


# ------------------------
# Order Items
# ------------------------

order_items = []

order_item_id = 1

order_totals = {}

for order in orders:

    order_total = 0

    item_count = random.randint(1, 5)

    for _ in range(item_count):

        product_id = random.randint(1, NUM_PRODUCTS)

        product_price = float(
            products_df.loc[
                products_df["product_id"] == product_id,
                "unit_price"
            ].iloc[0]
        )

        quantity = random.randint(1, 10)

        line_total = quantity * product_price

        order_total += line_total

        order_items.append({
            "order_item_id": order_item_id,
            "order_id": order["order_id"],
            "product_id": product_id,
            "quantity": quantity,
            "unit_price": product_price
        })

        order_item_id += 1

    order_totals[order["order_id"]] = round(order_total, 2)

for order in orders:
    order["total_amount"] = order_totals[order["order_id"]]

orders_df = pd.DataFrame(orders)

orders_df.to_csv(
    output_dir / "orders.csv",
    index=False
)

order_items_df = pd.DataFrame(order_items)

order_items_df.to_csv(
    output_dir / "order_items.csv",
    index=False
)

print(f"Generated {len(orders_df)} orders")
print(f"Generated {len(order_items_df)} order items")


# ------------------------
# Invoices
# ------------------------

invoices = []

for invoice_id, order in enumerate(orders, start=1):

    invoice_date = order["order_date"]

    invoices.append({
        "invoice_id": invoice_id,
        "customer_id": order["customer_id"],
        "invoice_date": invoice_date,
        "due_date": fake.date_between(
            start_date=invoice_date,
            end_date="+60d"
        ),
        "amount": order["total_amount"],
        "status": random.choice(
            ["paid", "pending", "overdue"]
        )
    })

invoices_df = pd.DataFrame(invoices)

invoices_df.to_csv(
    output_dir / "invoices.csv",
    index=False
)

print(f"Generated {len(invoices_df)} invoices")


# ------------------------
# Inventory
# ------------------------

inventory = []

for product in products:

    inventory.append({
        "inventory_id": product["product_id"],
        "product_id": product["product_id"],
        "current_stock": random.randint(0, 500),
        "last_updated": fake.date_time_this_year()
    })

inventory_df = pd.DataFrame(inventory)

inventory_df.to_csv(
    output_dir / "inventory.csv",
    index=False
)

print(f"Generated {len(inventory_df)} inventory records")

print("\nAll ERP sample data generated successfully.")