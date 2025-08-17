module.exports = {
    description: "Search pen inventory by name, brand, or category",
    schema: {
        type: "object",
        properties: {
            query: { type: "string" },
            category: { type: "string" },
            max_results: { type: "number", default: 10 }
        },
        required: ["query"]
    },
    
    async execute(args, pool) {
        const { query, category, max_results = 10 } = args;
        
        // Vulnerable SQL construction when security disabled
        const securityEnabled = process.env.SECURITY_CHECKS === 'true';
        
        let sqlQuery, params;
        
        if (securityEnabled) {
            // Secure parameterized query
            sqlQuery = `
                SELECT p.*, c.name as category_name 
                FROM pens p 
                LEFT JOIN categories c ON p.category_id = c.id 
                WHERE p.name ILIKE $1 OR p.brand ILIKE $1
                ${category ? 'AND c.name = $2' : ''}
                LIMIT $${category ? 3 : 2}
            `;
            params = [`%${query}%`];
            if (category) params.push(category);
            params.push(max_results);
        } else {
            // Vulnerable direct string interpolation
            sqlQuery = `
                SELECT p.*, c.name as category_name 
                FROM pens p 
                LEFT JOIN categories c ON p.category_id = c.id 
                WHERE p.name ILIKE '%${query}%' OR p.brand ILIKE '%${query}%'
                ${category ? `AND c.name = '${category}'` : ''}
                LIMIT ${max_results}
            `;
            params = [];
        }
        
        const result = await pool.query(sqlQuery, params);
        return {
            pens: result.rows,
            total: result.rowCount,
            query_used: securityEnabled ? 'parameterized' : 'direct'
        };
    }
};
