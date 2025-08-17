module.exports = {
    description: "Process pen orders",
    schema: {
        type: "object",
        properties: {
            pen_id: { type: "number" },
            customer_email: { type: "string" },
            quantity: { type: "number", default: 1 }
        },
        required: ["pen_id", "customer_email"]
    },
    
    async execute(args, pool) {
        const { pen_id, customer_email, quantity = 1 } = args;
        
        // Get customer
        const customerQuery = "SELECT * FROM customers WHERE email = $1";
        const customerResult = await pool.query(customerQuery, [customer_email]);
        
        if (customerResult.rows.length === 0) {
            throw new Error('Customer not found');
        }
        
        const customer = customerResult.rows[0];
        
        // Get pen
        const penQuery = "SELECT * FROM pens WHERE id = $1";
        const penResult = await pool.query(penQuery, [pen_id]);
        
        if (penResult.rows.length === 0) {
            throw new Error('Pen not found');
        }
        
        const pen = penResult.rows[0];
        const total = pen.price * quantity;
        
        // Create order
        const orderQuery = `
            INSERT INTO orders (customer_id, pen_id, quantity, total_amount, status)
            VALUES ($1, $2, $3, $4, 'pending')
            RETURNING *
        `;
        
        const orderResult = await pool.query(orderQuery, [
            customer.id, pen_id, quantity, total
        ]);
        
        return {
            order: orderResult.rows[0],
            customer_info: customer, // Vulnerable: Exposes customer data
            pen_info: pen
        };
    }
};
