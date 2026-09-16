import { useEffect, useState } from "react";
import API from "../services/api";

export default function Dashboard() {
    const [customers, setCustomers] = useState([]);
    const [revenue, setRevenue] = useState([]);

    useEffect(() => {
        API.get("/customers/top/")
            .then(res => setCustomers(res.data));

        API.get("/revenue/monthly/")
            .then(res => setRevenue(res.data));
    }, []);

    return (
        <div>
            <h1>ERP Copilot Dashboard</h1>

            <h2>Top Customers</h2>

            <pre>
                {JSON.stringify(customers.slice(0, 5), null, 2)}
            </pre>

            <h2>Monthly Revenue</h2>

            <pre>
                {JSON.stringify(revenue.slice(0, 5), null, 2)}
            </pre>
        </div>
    );
}