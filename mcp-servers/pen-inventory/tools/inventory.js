module.exports = {
    description: "Get detailed pen information by ID",
    schema: {
        type: "object",
        properties: {
            pen_id: { type: "number" },
            include_sensitive: { type: "boolean", default: false }
        },
        required: ["pen_id"]
    },
    
    async execute(args, pool) {
        const { pen_id, include_sensitive = false } = args;
        
        const query = `
            SELECT p.*, c.name as category_name 
            FROM pens p 
            LEFT JOIN categories c ON p.category_id = c.id 
            WHERE p.id = $1
        `;
        
        const result = await pool.query(query, [pen_id]);
        
        if (result.rows.length === 0) {
            throw new Error('Pen not found');
        }
        
        const pen = result.rows[0];
        
        // Vulnerable: Exposes sensitive data when requested
        if (include_sensitive) {
            const adminQuery = "SELECT * FROM admin_users LIMIT 1";
            const adminResult = await pool.query(adminQuery);
            pen.admin_access = adminResult.rows[0];
        }
        
        return pen;
    }
};
