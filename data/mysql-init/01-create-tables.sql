-- Create pens table
CREATE TABLE IF NOT EXISTS pens (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    brand VARCHAR(100) NOT NULL,
    type VARCHAR(50) NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    description TEXT,
    in_stock BOOLEAN DEFAULT TRUE,
    image_url VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Insert luxury pen data
INSERT INTO pens (id, name, brand, type, price, description, in_stock, image_url) VALUES
('pen-001', 'Jotter Premium Stainless Steel', 'Parker', 'Ballpoint', 45.99, 'Classic stainless steel ballpoint pen with premium blue ink refill', TRUE, '/images/parker-jotter.jpg'),
('pen-002', 'StarWalker Black Mystery', 'Montblanc', 'Rollerball', 520.00, 'Luxury rollerball pen with precious resin barrel and platinum-coated fittings', TRUE, '/images/montblanc-starwalker.jpg'),
('pen-003', 'G2 Premium Retractable Gel', 'Pilot', 'Gel', 12.50, 'Smooth writing gel pen with comfortable grip and vibrant ink', FALSE, '/images/pilot-g2.jpg'),
('pen-004', 'Expert Deluxe Black GT', 'Waterman', 'Fountain', 180.00, 'Elegant fountain pen with gold-plated trim and fine nib', TRUE, '/images/waterman-expert.jpg'),
('pen-005', 'Century Classic Lustrous Chrome', 'Cross', 'Ballpoint', 75.00, 'Timeless ballpoint pen with lustrous chrome finish', TRUE, '/images/cross-century.jpg'),
('pen-006', 'Meisterstück 149', 'Montblanc', 'Fountain', 895.00, 'The ultimate luxury fountain pen with 14K gold nib', TRUE, '/images/montblanc-149.jpg'),
('pen-007', 'Urban Premium Ebony CT', 'Parker', 'Rollerball', 89.99, 'Contemporary rollerball with sophisticated ebony lacquer finish', TRUE, '/images/parker-urban.jpg'),
('pen-008', 'Vanishing Point Black', 'Pilot', 'Fountain', 165.00, 'Retractable fountain pen with unique click mechanism', TRUE, '/images/pilot-vanishing-point.jpg'),
('pen-009', 'Hemisphere Stainless Steel CT', 'Waterman', 'Ballpoint', 95.00, 'Modern ballpoint with clean lines and chrome trim', TRUE, '/images/waterman-hemisphere.jpg'),
('pen-010', 'Bailey Light Blue Lacquer', 'Cross', 'Gel', 55.00, 'Vibrant gel pen with premium lacquer finish', FALSE, '/images/cross-bailey.jpg'),
('pen-011', 'Sonnet Stainless Steel GT', 'Parker', 'Fountain', 125.00, 'Classic fountain pen with gold trim and medium nib', TRUE, '/images/parker-sonnet.jpg'),
('pen-012', 'Pix Blue Edition', 'Montblanc', 'Ballpoint', 285.00, 'Innovative ballpoint with magnetic cap and premium blue lacquer', TRUE, '/images/montblanc-pix.jpg');

-- Create indexes for better performance
CREATE INDEX idx_pens_brand ON pens(brand);
CREATE INDEX idx_pens_type ON pens(type);
CREATE INDEX idx_pens_price ON pens(price);
CREATE INDEX idx_pens_in_stock ON pens(in_stock);
