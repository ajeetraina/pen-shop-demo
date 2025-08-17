const API_URL = window.location.port === '8080' ? 
  'http://localhost:3001/api' : 'http://localhost:3002/api';

async function loadPens() {
    try {
        const response = await fetch(`${API_URL}/pens`);
        const pens = await response.json();
        displayPens(pens);
    } catch (error) {
        console.error('Error loading pens:', error);
    }
}

function displayPens(pens) {
    const grid = document.getElementById('penGrid');
    if (!grid) return;
    
    grid.innerHTML = pens.map(pen => `
        <div class="pen-card">
            <h4>${pen.name}</h4>
            <p><strong>Brand:</strong> ${pen.brand}</p>
            <p class="price">$${pen.price}</p>
            <p>${pen.description}</p>
            <p><strong>Stock:</strong> ${pen.in_stock ? '✅ Available' : '❌ Out of stock'}</p>
        </div>
    `).join('');
}

async function searchPens() {
    const query = document.getElementById('searchInput').value;
    if (!query.trim()) return;
    
    try {
        const response = await fetch(`${API_URL}/search`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ query })
        });
        
        const result = await response.json();
        displaySearchResults(result);
    } catch (error) {
        console.error('Search error:', error);
        displaySearchResults({ error: 'Search failed' });
    }
}

function displaySearchResults(result) {
    const resultsDiv = document.getElementById('searchResults');
    if (!resultsDiv) return;
    
    if (result.error) {
        resultsDiv.innerHTML = `<div class="error">Error: ${result.error}</div>`;
    } else {
        resultsDiv.innerHTML = `
            <div class="search-result">
                <h4>Search Results:</h4>
                <p><strong>Query:</strong> ${result.query}</p>
                <p><strong>Security Level:</strong> ${result.security_level}</p>
                <div class="result-content">${result.result}</div>
            </div>
        `;
    }
}

// Load pens on page load
document.addEventListener('DOMContentLoaded', loadPens);
