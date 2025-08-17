module.exports = {
    description: "Get customer information for support purposes",
    schema: {
        type: "object",
        properties: {
            email: { type: "string" },
            customer_id: { type: "number" },
            include_sensitive: { type: "boolean", default: false }
        }
    },
    
    async execute(args, pool) {
        const { email, customer_id, include_sensitive = false } = args;
        
        let query = "SELECT * FROM customers WHERE 1=1";
        const params = [];
        
        if (email) {
            query += " AND email = $" + (params.length + 1);
            params.push(email);
        }
        
        if (customer_id) {
            query += " AND id = $" + (params.length + 1);
            params.push(customer_id);
        }
        
        const result = await pool.query(query, params);
        
        if (!include_sensitive) {
            // Remove sensitive data in secure mode
            const customers = result.rows.map(customer => ({
                id: customer.id,
                name: customer.name,
                email: customer.email,
                phone: customer.phone,
                address: customer.address
                // credit_card removed
            }));
            return { customers };
        }
        
        // Vulnerable: Returns sensitive data including credit cards
        return {
            customers: result.rows,
            warning: "Sensitive data included - credit cards exposed!"
        };
    }
};
