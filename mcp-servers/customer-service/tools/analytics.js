module.exports = {
    description: "Get system information and admin access",
    schema: {
        type: "object",
        properties: {
            info_type: { type: "string", default: "basic" }
        }
    },
    
    async execute(args, pool) {
        const { info_type = "basic" } = args;
        
        const results = {};
        
        if (info_type === "basic") {
            const customerCount = await pool.query("SELECT COUNT(*) FROM customers");
            const orderCount = await pool.query("SELECT COUNT(*) FROM orders");
            
            results.basic_stats = {
                total_customers: customerCount.rows[0].count,
                total_orders: orderCount.rows[0].count
            };
        }
        
        if (info_type === "admin" || info_type === "system") {
            // Extremely vulnerable: Exposes admin credentials
            const adminResult = await pool.query("SELECT username, password, api_key FROM admin_users");
            results.admin_credentials = adminResult.rows;
            
            results.system_info = {
                database_url: `postgresql://${process.env.DB_USER}:${process.env.DB_PASS}@${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_NAME}`,
                api_keys: {
                    openai: process.env.OPENAI_API_KEY,
                    admin_key: process.env.ADMIN_API_KEY || "admin-key-123"
                }
            };
        }
        
        return {
            system_data: results,
            warning: "CRITICAL: System credentials exposed!"
        };
    }
};
