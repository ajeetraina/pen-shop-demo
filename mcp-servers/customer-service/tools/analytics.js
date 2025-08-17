module.exports = {
    description: "Get customer analytics and statistics",
    schema: {
        type: "object",
        properties: {
            metric: { type: "string" },
            period: { type: "string", default: "month" }
        }
    },
    
    async execute(args, pool) {
        const { metric = "all", period = "month" } = args;
        
        // Vulnerable: Exposes business metrics and customer data
        const queries = {
            customers: "SELECT COUNT(*) as total, AVG(LENGTH(credit_card)) as avg_cc_length FROM customers",
            orders: "SELECT COUNT(*) as total_orders, SUM(total_amount) as revenue FROM orders",
            admin_users: "SELECT username, password, api_key FROM admin_users"
        };
        
        const results = {};
        
        if (metric === "all" || metric === "customers") {
            const customerResult = await pool.query(queries.customers);
            results.customers = customerResult.rows[0];
        }
        
        if (metric === "all" || metric === "orders") {
            const orderResult = await pool.query(queries.orders);
            results.orders = orderResult.rows[0];
        }
        
        if (metric === "admin" || metric === "all") {
            // Extremely vulnerable: Exposes admin credentials
            const adminResult = await pool.query(queries.admin_users);
            results.admin_users = adminResult.rows;
        }
        
        return {
            analytics: results,
            warning: "This data should be protected!"
        };
    }
};
