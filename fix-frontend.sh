#!/bin/bash

echo "🔧 Fixing frontend JavaScript API calls..."

# Create the corrected index.html with proper API calls
cat > index.html << 'EOF'
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Pen Shop - Premium Writing Instruments</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: 'Arial', sans-serif;
            line-height: 1.6;
            color: #333;
            background-color: #f4f4f4;
        }
        
        .container {
            max-width: 1200px;
            margin: 0 auto;
            padding: 20px;
        }
        
        header {
            background: #2c3e50;
            color: white;
            padding: 1rem 0;
            margin-bottom: 2rem;
        }
        
        h1 {
            text-align: center;
            margin-bottom: 0.5rem;
        }
        
        .subtitle {
            text-align: center;
            opacity: 0.8;
        }
        
        .api-info {
            background: white;
            padding: 20px;
            border-radius: 8px;
            margin-bottom: 20px;
            box-shadow: 0 2px 5px rgba(0,0,0,0.1);
        }
        
        .pen-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 20px;
            margin-top: 20px;
        }
        
        .pen-card {
            background: white;
            border-radius: 8px;
            padding: 20px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            transition: transform 0.3s ease;
        }
        
        .pen-card:hover {
            transform: translateY(-5px);
        }
        
        .pen-name {
            font-size: 1.2rem;
            font-weight: bold;
            color: #2c3e50;
            margin-bottom: 10px;
        }
        
        .pen-brand {
            color: #3498db;
            font-weight: bold;
            margin-bottom: 5px;
        }
        
        .pen-price {
            font-size: 1.5rem;
            color: #e74c3c;
            font-weight: bold;
            margin: 10px 0;
        }
        
        .btn {
            background: #3498db;
            color: white;
            padding: 10px 20px;
            border: none;
            border-radius: 5px;
            cursor: pointer;
            text-decoration: none;
            display: inline-block;
            transition: background 0.3s ease;
        }
        
        .btn:hover {
            background: #2980b9;
        }
        
        .status {
            padding: 5px 10px;
            border-radius: 20px;
            font-size: 0.8rem;
            font-weight: bold;
        }
        
        .in-stock {
            background: #d4edda;
            color: #155724;
        }
        
        .endpoint {
            background: #f8f9fa;
            padding: 10px;
            border-radius: 5px;
            font-family: monospace;
            margin: 5px 0;
        }
        
        .category {
            background: #fff3cd;
            color: #856404;
            padding: 3px 8px;
            border-radius: 12px;
            font-size: 0.8rem;
            display: inline-block;
        }
    </style>
</head>
<body>
    <header>
        <div class="container">
            <h1>🖋️ Pen Shop</h1>
            <p class="subtitle">Premium Writing Instruments & Fine Stationery</p>
        </div>
    </header>

    <div class="container">
        <div class="api-info">
            <h2>🔗 API Endpoints</h2>
            <p><strong>Pen Catalogue API:</strong> <a href="http://localhost:9092">http://localhost:9092</a></p>
            <p><strong>MCP Gateway:</strong> <a href="http://localhost:8080">http://localhost:8080</a></p>
            
            <h3>Available Endpoints:</h3>
            <div class="endpoint">GET /api/pens - List all pens</div>
            <div class="endpoint">GET /api/pens/:id - Get specific pen</div>
            <div class="endpoint">GET /health - API health check</div>
        </div>

        <div class="pen-grid" id="penGrid">
            <div>Loading pens...</div>
        </div>
    </div>

    <script>
        // Load pens from API
        async function loadPens() {
            try {
                console.log('Loading pens from API...');
                const response = await fetch('http://localhost:9092/api/pens');
                console.log('API Response status:', response.status);
                
                if (!response.ok) {
                    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
                }
                
                const data = await response.json();
                console.log('API Data:', data);
                
                if (data.success && data.pens) {
                    displayPens(data.pens);
                } else {
                    throw new Error('Invalid API response format');
                }
            } catch (error) {
                console.error('Error loading pens:', error);
                document.getElementById('penGrid').innerHTML = 
                    `<div style="grid-column: 1/-1; text-align: center; padding: 20px; background: #fff3cd; border-radius: 8px;">
                        <h3>⚠️ Unable to load pens</h3>
                        <p>API Error: ${error.message}</p>
                        <p>Make sure the pen-catalogue service is running on port 9092</p>
                        <button onclick="loadPens()" class="btn" style="margin-top: 10px;">🔄 Retry</button>
                    </div>`;
            }
        }

        function displayPens(pens) {
            console.log('Displaying pens:', pens.length);
            const grid = document.getElementById('penGrid');
            grid.innerHTML = pens.map(pen => `
                <div class="pen-card">
                    <div class="pen-brand">${pen.brand}</div>
                    <div class="pen-name">${pen.name}</div>
                    <div class="category">${pen.category}</div>
                    <p>${pen.description}</p>
                    <div class="pen-price">$${pen.price}</div>
                    <div class="status in-stock">
                        ${pen.in_stock ? '✅ In Stock' : '❌ Out of Stock'} (${pen.stock_count})
                    </div>
                    <button class="btn" onclick="viewPen('${pen.id}')">View Details</button>
                </div>
            `).join('');
        }

        function viewPen(id) {
            window.open(`http://localhost:9092/api/pens/${id}`, '_blank');
        }

        // Load pens when page loads
        loadPens();
    </script>
</body>
</html>
EOF

echo "✅ Frontend JavaScript updated to use /api/pens"
echo "🔄 Restarting frontend container..."

# Restart frontend to pick up changes
docker compose restart pen-front-end

echo "⏳ Waiting for frontend to start..."
sleep 3

echo "🌐 Frontend ready! Visit: http://localhost:9091"
echo "🧪 Testing API endpoint:"
curl -s http://localhost:9092/api/pens | jq '.total_pens'
