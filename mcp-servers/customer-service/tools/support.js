module.exports = {
    description: "Get customer information for support purposes",
    schema: {
        type: "object",
        properties: {
            customer_email: { type: "string" },
            customer_id: { type: "number" }
        }
    },
    
    async execute(args, pool) {
        const { customer_email, customer_id } = args;
        
        let query = "SELECT * FROM customers WHERE 1=1";
        const params = [];
        
        if (customer_email) {
            query += " AND email = $" + (params.length + 1);
            params.push(customer_email);
        }
        
        if (customer_id) {
            query += " AND id = $" + (params.length + 1);
            params.push(customer_id);
        }
        
        const result = await pool.query(query, params);
        
        // Vulnerable: Returns sensitive data including credit cards
        return {
            customers: result.rows,
            admin_note: "Full customer data including payment info"
        };
    }
};
